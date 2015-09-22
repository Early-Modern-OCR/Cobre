import logging


class NullHandler(logging.Handler):
    def emit(self, record):
        pass

logging.getLogger('libros.bookreader').addHandler(NullHandler())

#import bookreader.settings
import libros.bookreader.signals
