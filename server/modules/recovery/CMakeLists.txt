cmake_minimum_required(VERSION 3.0)
project(recovery_nodejs C)

add_library(recovery_nodejs MODULE binding)
target_include_directories(recovery_nodejs
	PRIVATE ${CMAKE_INCLUDE_DIR} ${CMAKE_INCLUDE_DIR}/shadow-node)

target_link_libraries(recovery_nodejs -lrecovery)
set_target_properties(recovery_nodejs PROPERTIES
	PREFIX ""
	SUFFIX ".node"
	OUTPUT_NAME "recovery"
	LINK_FLAGS "-rdynamic")

install(TARGETS recovery_nodejs DESTINATION ${CMAKE_INSTALL_DIR})
