
let uname = require('node-uname')
let execa = require('execa')

let ENV = {}

ENV['ORIGINAL_CFLAGS'] = process.env.CFLAGS
ENV['ORIGINAL_CXXFLAGS'] = process.env.CXXFLAGS

switch (uname().sysname) {
    case 'Linux':
        ENV['RMDIR'] = 'rmdir -p --ignore-fail-on-non-empty',
        ENV['STRIP_DEBUG'] = 'strip --strip-debug',
        ENV['STRIP_UNNEEDED'] = 'strip --strip-unneeded'
        break;

    case 'Darwin':
        ENV['RMDIR'] = 'rmdir -p'
        ENV['STRIP_DEBUG'] = 'strip -u -r -S'
        ENV['STRIP_UNNEEDED'] = 'strip -u -r -x'
        break;

    default:
        break;
}

const argv = require('yargs').argv

if (argv.b === '32' || argv.b === '64') {
    ENV['BITS'] = argv.b
}

if (argv.c) {
    ENV['CPU'] = argv.c
}

if (argv.M) {
    ENV['MACHINE'] = argv.M
}

if (! ENV['BITS'] && !ENV['CPU'] && !ENV['MACHINE'] && !ENV['NODE_ARCH']) {
    ENV['NODE_ARCH'] = process.env.npm_config_arch
}

switch (ENV['NODE_ARCH']) {
    case 'arm':
        ENV['CPU'] = 'cortex-a7'
        break;

    case 'arm64':
        ENV['CPU'] = 'cortex-a53'
        break;

    case 'ia32':
        ENV['BITS'] = '32'
        ENV['MACHINE'] = 'pc'
        break;

    case 'x64':
        ENV['BITS'] = '64'
        ENV['MACHINE'] = 'pc'
        break;

    default:
        break;
}

// default machine
if (! ENV['MACHINE']) ENV['MACHINE'] = 'pc'

// default cpu for each machine
if (! ENV['CPU']) {
    switch (ENV['MACHINE']) {
        case 'pc':
            
            switch (ENV['BITS']) {
                case '32':
                    ENV['CPU'] = 'i686'

                case '64':
                    ENV['CPU'] = 'nocona'

                default:
                    ENV['CPU'] = uname().machine
                    break;
            }

            break;

        case 'raspi':
            ENV['CPU'] = 'arm1176jzf-s'
            break;
    
        case 'raspi2':
            ENV['CPU'] = 'cortex-a7'
            break;

        case 'raspi3':
            ENV['CPU'] = 'cortex-a53'
            break;

        default:
            break;
    }
}

switch (ENV['CPU']) {

    // raspi
    case 'arm1176jzf-s':
        ENV['ARCH'] = 'arm'
        ENV['BITS'] = '32'
        ENV['CPU_FAMILY'] = 'arm'
        ENV['CPU_PORT'] = 'armhf'
        ENV['FLOAT_ABI'] = 'hard'
        ENV['FPU'] = 'vfp'
        ENV['NODE_ARCH'] = 'arm'
        ENV['TARGET'] = 'armv6zk-nodeos-linux-musleabihf'
        break;

    // raspi2
    case 'cortex-a7':
        ENV['ARCH'] = 'arm'
        ENV['BITS'] = '32'
        ENV['CPU_FAMILY'] = 'arm'
        ENV['CPU_PORT'] = 'armhf'
        ENV['FLOAT_ABI'] = 'hard'
        ENV['FPU'] = 'vfpv4'
        ENV['NODE_ARCH'] = 'arm'
        ENV['TARGET'] = 'armv7ve-nodeos-linux-musleabihf'
        break;

    // raspi3
    case 'cortex-a53':
        ENV['ARCH'] = 'arm'
        ENV['BITS'] = '64'
        ENV['CPU_FAMILY'] = 'arm'
        ENV['CPU_PORT'] = 'armhf'
        ENV['FLOAT_ABI'] = 'hard'
        ENV['FPU'] = 'crypto-neon-fp-armv8'
        ENV['NODE_ARCH'] = 'arm64'
        ENV['TARGET'] = 'armv8va-nodeos-linux-musleabihf'
        break;

    // pc 32
    case 'i386':
    case 'i486':
    case 'i586':
    case 'i686':
    case 'i786':
    case 'i886':
        ENV['ARCH'] = 'x86'
        ENV['BITS'] = '32'
        ENV['CPU_FAMILY'] = 'i386'
        ENV['CPU_PORT'] = ENV['CPU_FAMILY']
        ENV['NODE_ARCH'] = 'ia32'
        ENV['TARGET'] = `${ENV['CPU']}-nodeos-linux-musl`
        break;

    case 'athlon64':
    case 'athlon-fx':
    case 'atom':
    case 'core2':
    case 'k8':
    case 'nocona':
    case 'opteron':
    case 'x86_64':
        ENV['ARCH'] = 'x86'
        ENV['BITS'] = '64'
        ENV['CPU_FAMILY'] = 'x86_64'
        ENV['CPU_PORT'] = ENV['CPU_FAMILY']
        ENV['NODE_ARCH'] = 'x64'
        ENV['TARGET'] = 'x86_64-nodeos-linux-musl'
        break;

    default:
        break;
}

ENV['HOST'] = execa.shellSync('echo $(echo ${MACHTYPE} | sed "s/-[^-]*/-cross/")').stdout

if (! process.env.JOBS || ! ENV['JOBS']) {
    ENV['JOBS'] = execa.shellSync('echo $((`getconf _NPROCESSORS_ONLN` + 1))').stdout
}

ENV['OBJECTS'] = `${process.env.PWD}/build/${ENV['CPU']}`
ENV['MAKE1']   = `make --silent LIBTOOLFLAGS=--silent V=`
ENV['MAKE']    = `${ENV['MAKE1']} --jobs=${ENV['JOBS']}`

ENV['KERNEL_NAME'] = execa.shellSync('echo $(uname -s | tr \'[:upper:]\' \'[:lower:]\')').stdout

module.exports = ENV