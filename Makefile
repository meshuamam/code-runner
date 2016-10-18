HOSTNAME=quay.io/codaisseur

# Building haskell and erlang images have been suspended (frozen) until they are able to be repaired
# CONTAINERS=dotnet jvm node python ruby alt func dart systems erlang haskell
# CONTAINERS=dotnet jvm node python ruby alt func dart systems rust julia crystal
CONTAINERS=node dotnet jvm python ruby alt rust julia crystal

ALL_CONTAINERS=${CONTAINERS} base

.PHONY: ${ALL_CONTAINERS} clean docker_rm docker_rmi

all: ${CONTAINERS}

base:
	cp docker/$@.docker ./Dockerfile
	docker build -t $(HOSTNAME)/$@-runner .

${CONTAINERS}: base
	cp docker/$@.docker ./Dockerfile
	docker build -t $(HOSTNAME)/$@-runner .


# Kill all of the in-flight and exited docker containers
docker_rm:
	docker ps -q | xargs docker stop
	[ ! -n "$(shell docker ps -a -q)" ] || echo $(shell docker ps -a -q) | xargs -n 1 docker rm -f

# Kill all docker images
docker_rmi: docker_rm
	[ ! -n "$(shell docker images -q)" ] || docker images -q | xargs -n 1 docker rmi -f

clean: docker_rm_exited docker_rmi_temporary

deep-clean: docker_rmi

pull:
	docker pull quay.io/codaisseur/base-runner
	docker pull quay.io/codaisseur/ruby-runner
	# docker pull quay.io/codaisseur/node-runner
	# docker pull quay.io/codaisseur/python-runner
	# docker pull quay.io/codaisseur/dotnet-runner
	# docker pull quay.io/codaisseur/jvm-runner
	# docker pull quay.io/codaisseur/systems-runner
	# docker pull quay.io/codaisseur/func-runner
	# docker pull quay.io/codaisseur/erlang-runner
	# docker pull quay.io/codaisseur/alt-runner
	# docker pull quay.io/codaisseur/rust-runner || true
	# docker pull quay.io/codaisseur/julia-runner || true
	# docker pull quay.io/codaisseur/crystal-runner || true
	# docker pull quay.io/codaisseur/dart-runner || true

save:
	docker save codaisseur/base-runner > build/image.tar
	docker save codaisseur/ruby-runner > build/image.tar
	# docker save codaisseur/node-runner > build/image.tar
	# docker save codaisseur/python-runner > build/image.tar
	# docker save codaisseur/dotnet-runner > build/image.tar
	# docker save codaisseur/jvm-runner > build/image.tar
	# docker save codaisseur/func-runner > build/image.tar
	# docker save codaisseur/erlang-runner > build/image.tar
	# docker save codaisseur/alt-runner > build/image.tar
	# docker save codaisseur/rust-runner > build/image.tar
	# docker save codaisseur/dart-runner > build/image.tar
	# docker save codaisseur/crystal-runner > build/image.tar
	# docker save codaisseur/julia-runner > build/image.tar

push:
	docker push quay.io/codaisseur/base-runner
	docker push quay.io/codaisseur/ruby-runner
	# docker push quay.io/codaisseur/node-runner
