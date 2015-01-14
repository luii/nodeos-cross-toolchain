#!/usr/bin/env bash

# Platform aliases
case $PLATFORM in
  ""|pc|qemu)
    PLATFORM=pc_qemu
  ;;
  image)
    PLATFORM=pc_image
  ;;

  docker)
    PLATFORM=docker_64
  ;;

  qemu_32)
    PLATFORM=pc_qemu_32
  ;;
  image_32)
    PLATFORM=pc_image_32
  ;;

  qemu_64)
    PLATFORM=pc_qemu_64
  ;;
  image_64)
    PLATFORM=pc_image_64
  ;;

  raspberry)
    PLATFORM=raspberry_qemu
  ;;
esac

# default CPU for each platform
if [[ -z "$CPU" ]]; then
  case $PLATFORM in
    pc_qemu|pc_image)
#      CPU=`uname -m`
      CPU=native  # native  # https://gcc.gnu.org/onlinedocs/gcc-4.9.2/gcc/i386-and-x86-64-Options.html#i386-and-x86-64-Options
    ;;

    docker_32|pc_qemu_32|pc_image_32)
      CPU=i686
    ;;
    docker_64|pc_qemu_64|pc_image_64)
#      CPU=x86_64
      CPU=nocona
    ;;

    raspberry_qemu|raspberry_image)
      CPU=armv6
    ;;
  esac
fi

# Normalice platforms
case $PLATFORM in
  docker_32|docker_64)
    PLATFORM=docker
  ;;

  pc_qemu_32|pc_qemu_64)
    PLATFORM=pc_qemu
  ;;
  pc_image_32|pc_image_64)
    PLATFORM=pc_image
  ;;

#  raspberry_qemu)
#    PLATFORM=raspberry
#  ;;
esac

# Set target and architecture for the selected CPU
case $CPU in
  armv6)
    TARGET=$CPU-nodeos-linux-musleabihf
    ARCH="arm"
    NODE_ARCH=arm
  ;;
  i[34567]86)
    TARGET=$CPU-nodeos-linux-musl
    ARCH="x86"
    NODE_ARCH=ia32
  ;;
#  x86_64)
  nocona)
#    TARGET=$CPU-nodeos-linux-musl
    TARGET=x86_64-nodeos-linux-musl
    ARCH="x86"
    NODE_ARCH=x64
  ;;
  *)
    echo "Unknown CPU '$CPU'"
    exit 1
  ;;
esac


# Set host triplet and number of concurrent jobs
HOST=$(echo ${MACHTYPE} | sed "s/-[^-]*/-cross/")

if [[ -z $JOBS ]]; then
  JOBS=$((`getconf _NPROCESSORS_ONLN` + 1))
fi


# Auxiliar variables
OBJECTS=`pwd`/obj/$CPU
OUT_DIR=`pwd`/out/$CPU

PATH=$TOOLS/bin:/bin:/usr/bin

MAKE="make --jobs=$JOBS"
