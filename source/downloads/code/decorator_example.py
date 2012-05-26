#!/usr/bin/env python

# Our magic device
import random

def roof(amount):
    def decorator(method):
        def wrapper(*args):

            value = method(*args)
            if value > amount:
                return amount
            else:
                return value

        return wrapper
    return decorator


class Device(object):

    @roof(50)
    def get_value(self):
        # Read value from the device
        return random.randint(0, 100)


if __name__ == '__main__':
    reader = Device()
    for i in range(10):
        print reader.get_value()

