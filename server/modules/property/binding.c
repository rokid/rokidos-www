#include <stdlib.h>
#include <stdio.h>
#include <shadow-node/iotjs.h>
#include <shadow-node/iotjs_def.h>
#include <shadow-node/iotjs_binding.h>
#include <cutils/properties.h>

JS_FUNCTION(GetProperty) {
  jerry_size_t size = jerry_get_string_size(jargv[0]);
  char* key = iotjs_buffer_allocate(size + 1);
  jerry_char_t* jkey = (jerry_char_t*)(key);

  size_t check = jerry_string_to_char_buffer(jargv[0], jkey, size);
  IOTJS_ASSERT(check == size);
  key[size] = '\0';

  char val[PROP_VALUE_MAX];
  property_get(key, (char*)&val, "");
  return jerry_create_string((const jerry_char_t*)val);
}

JS_FUNCTION(SetProperty) {
  return jerry_create_boolean(false);
}

void init(jerry_value_t exports) {
  iotjs_jval_set_method(exports, "get", GetProperty);
  iotjs_jval_set_method(exports, "set", SetProperty);
}

NODE_MODULE(property, init)
