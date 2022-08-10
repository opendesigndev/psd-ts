export EM_CACHE=$(shell pwd)/.em_cache
export CFLAGS=-Oz -flto
export LFLAGS=-flto

build: lib.c build/Makefile
	cd build &&emmake make
	emcc \
		${LFLAGS} \
		-Oz \
		-o ./build/lcms.html \
		--closure-compiler=1 \
		-I ./Little-CMS/include/ \
		lib.c ./build/src/*.o \
		-sEXPORTED_RUNTIME_METHODS=ccall \
		--embed-file ./icc/ \
		-sWASM=0 \
		--no-entry

build/Makefile:
	mkdir -p build
	cd build && emconfigure ../Little-CMS/configure

clean:
	rm -r build .em_cache

.PHONY: build clean
