ifneq ($(CROSS_COMPILE),)
$(info CROSS_COMPILE=$(CROSS_COMPILE))
endif

CC := $(CROSS_COMPILE)gcc
CXX := $(CROSS_COMPILE)g++
AR := $(CROSS_COMPILE)ar
LD := $(CROSS_COMPILE)g++

.PHONY: all

all:
	$(CXX) apis/www.cc -Wall -std=c++11 \
		-DMG_ENABLE_HTTP_STREAMING_MULTIPART \
		-lmongoose -lrecovery -o www
