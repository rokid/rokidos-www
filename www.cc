#include <mongoose.h>

#define PORT "80"
static struct mg_serve_http_opts s_http_server_opts;
static void ev_handler(struct mg_connection *nc, int ev, void *p) {
  if (ev == MG_EV_HTTP_REQUEST) {
    mg_serve_http(nc, (struct http_message *) p, s_http_server_opts);
  }
}

int main(void) {
  struct mg_mgr mgr;
  struct mg_connection *nc;

  mg_mgr_init(&mgr, NULL);
  nc = mg_bind(&mgr, PORT, ev_handler);
  if (nc == NULL) {
    printf("Failed to create listener\n");
    return 1;
  }

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