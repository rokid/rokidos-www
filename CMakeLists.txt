cmake_minimum_required(VERSION 2.8)
project(rokidos_web_server)

include(ExternalProject)
ExternalProject_Add(property
	SOURCE_DIR server/modules/property
	CMAKE_ARGS -DCMAKE_INCLUDE_DIR=${CMAKE_INCLUDE_DIR} -DCMAKE_INSTALL_DIR=${CMAKE_INSTALL_DIR} -DCMAKE_C_COMPILER=${CMAKE_C_COMPILER})
ExternalProject_Add(recovery
	SOURCE_DIR server/modules/recovery
	CMAKE_ARGS -DCMAKE_INCLUDE_DIR=${CMAKE_INCLUDE_DIR} -DCMAKE_INSTALL_DIR=${CMAKE_INSTALL_DIR} -DCMAKE_C_COMPILER=${CMAKE_C_COMPILER})

