#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <mongoose.h>
#include <rokid/recovery.h>
#include <cutils/properties.h>

typedef struct http_message http_message_t;
typedef struct mg_connection mg_connection_t;
typedef struct mg_http_multipart_part mg_http_multipart_part_t;
typedef struct mg_str mg_str_t;
typedef struct mg_mgr mg_mgr_t;
typedef struct file_writer_data {
  FILE* fp;
  size_t bytes_written;
} file_writer_data_t;

#define PORT "80"
#define UPGRADE_OTA_PATH "/data/ota_upgrade.img"

static struct mg_serve_http_opts s_http_server_opts;

static void recovery() {
  struct boot_cmd cmd;
  memset(&cmd, 0, sizeof(cmd));
  strncpy(cmd.boot_mode, BOOTMODE_RECOVERY, strlen(BOOTMODE_RECOVERY));
  strncpy(cmd.recovery_path, UPGRADE_OTA_PATH, strlen(UPGRADE_OTA_PATH));
  strncpy(cmd.recovery_state, BOOTSTATE_READY, strlen(BOOTSTATE_READY));
  set_recovery_cmd_status(&cmd);
}

static void ev_handler(mg_connection_t* nc, int ev, void* p) {
  switch (ev) {
    case MG_EV_HTTP_REQUEST:
      http_message_t *msg = (http_message_t*)p;
      mg_serve_http(nc, msg, s_http_server_opts);
      break;
  }
}

static void ping_handler(mg_connection_t* nc, int ev, void* p) {
  mg_printf(nc, "%s",
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: text/plain\r\n"
            "Connection: close\r\n\r\n"
            "Alive\n\n");
  nc->flags |= MG_F_SEND_AND_CLOSE;
  return;
}

static void info_handler(mg_connection_t* nc, int ev, void* p) {
  char version[PROP_VALUE_MAX];
  char platform[PROP_VALUE_MAX];
  char date[PROP_VALUE_MAX];
  property_get("ro.rokid.build.version.release", &version, "");
  property_get("ro.rokid.build.platform", &platform, "");
  property_get("ro.rokid.build.date", &date, "");
  mg_printf(nc,
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: application/json\r\n"
            "Connection: close\r\n\r\n"
            "{"
              "\"version\":\"%s\","
              "\"platform\":\"%s\","
              "\"date\":\"%s\""
            "}\n\n",
            version, platform, date);
  nc->flags |= MG_F_SEND_AND_CLOSE;
  return;
}

static void upload_image_handler(mg_connection_t* nc, int ev, void* p) {
  file_writer_data_t* data = (file_writer_data_t*)nc->user_data;
  mg_http_multipart_part_t* multipart = (mg_http_multipart_part_t*)p;

  switch (ev) {
    case MG_EV_HTTP_PART_BEGIN: {
      if (data == NULL) {
        data = (file_writer_data_t*)calloc(1, sizeof(file_writer_data_t));
        data->fp = fopen(UPGRADE_OTA_PATH, "w");
        data->bytes_written = 0;

        if (data->fp == NULL) {
          mg_printf(nc, "%s",
                    "HTTP/1.1 500 Failed to open a file\r\n"
                    "Content-Length: 0\r\n\r\n");
          nc->flags |= MG_F_SEND_AND_CLOSE;
          return;
        }
        nc->user_data = (void *) data;
      }
      break;
    }
    case MG_EV_HTTP_PART_DATA: {
      if (fwrite(multipart->data.p, 1, multipart->data.len, data->fp) != multipart->data.len) {
        mg_printf(nc, "%s",
                  "HTTP/1.1 500 Failed to write to a file\r\n"
                  "Content-Length: 0\r\n\r\n");
        nc->flags |= MG_F_SEND_AND_CLOSE;
        return;
      }
      data->bytes_written += multipart->data.len;
      break;
    }
    case MG_EV_HTTP_PART_END: {
      mg_printf(nc,
                "HTTP/1.1 200 OK\r\n"
                "Content-Type: text/plain\r\n"
                "Connection: close\r\n\r\n"
                "Written %ld of POST data to a temp file\n\n",
                (long) ftell(data->fp));
      nc->flags |= MG_F_SEND_AND_CLOSE;
      fclose(data->fp);
      free(data);
      nc->user_data = NULL;
      recovery();
      system("reboot");
      break;
    }
  }
}

int main(void) {
  mg_mgr_t mgr;
  mg_connection_t* nc;

  mg_mgr_init(&mgr, NULL);
  nc = mg_bind(&mgr, PORT, ev_handler);
  if (nc == NULL) {
    printf("Failed to create listener\n");
    return 1;
  }

  // set endpoint
  mg_register_http_endpoint(nc, "/apis/ping", ping_handler);
  mg_register_http_endpoint(nc, "/apis/info", info_handler);
  mg_register_http_endpoint(nc, "/apis/upgrade/upload-image", upload_image_handler);

  // Set up HTTP server parameters
  mg_set_protocol_http_websocket(nc);
  s_http_server_opts.document_root = "/opt/www/";  // Serve current directory
  s_http_server_opts.custom_mime_types = 
    ".html=text/html;charset=utf-8,.css=text/css;charset=utf-8,.js=text/javascript;charset=utf-8";
  // s_http_server_opts.enable_directory_listing = "no";

  for (;;) {
    mg_mgr_poll(&mgr, 1000);
  }
  mg_mgr_free(&mgr);

  return 0;
}