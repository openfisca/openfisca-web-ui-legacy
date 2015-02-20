var logger = console;

if ( ! logger) {
  class Logger {
    error() { }
    log() { }
  }
  logger = new Logger();
}


module.exports = logger;
