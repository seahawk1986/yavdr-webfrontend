#!/usr/bin/make

# Project settings
NAME = yavdr-wfe
DIST_DIR = dist

# 1. Get the most recent tag (e.g., 0.0.1)
# 2. Get datetime of the commit (YYYYMMDDHHMM)
# 3. Get distance from tag and short hash (e.g., -4-deadbeef)
GIT_TAG := $(shell git describe --tags --abbrev=0 2>/dev/null || echo "0.0.0")
GIT_DATE := $(shell git show -s --format=%ci HEAD | awk '{gsub(/[- :]/,""); print substr($$1,1,12)}')
GIT_DESC := $(shell git describe --tags --long --always --abbrev=7 | sed 's/^$(GIT_TAG)-//')

# Construct the full version string
# Format: yavdr-wfe-0.0.1+git202601051400-4-deadbeef
VERSION_STR = $(GIT_TAG)+git$(GIT_DATE)-$(GIT_DESC)
ARCHIVE_NAME = $(NAME)_$(VERSION_STR).orig.tar.gz
ROOT_DIR = $(NAME)-$(VERSION_STR)

.PHONY: all build archive clean

all: archive

build:
	npm run build

archive: build
	@echo "Creating archive: $(ARCHIVE_NAME)"
	tar -czf ../$(ARCHIVE_NAME) \
		--transform 's|^$(DIST_DIR)|$(ROOT_DIR)|' \
		$(DIST_DIR)/

clean:
	rm -f *.tar.gz
