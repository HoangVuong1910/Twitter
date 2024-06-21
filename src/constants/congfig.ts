import argv from 'minimist'

const options = argv(process.argv.slice(2))
// console.log(options) // { _: [ 'development' ] }
// console.log(options.development) //true

export const isProduction = Boolean(options.production)
