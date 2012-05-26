#!/usr/bin/env coffee

roof = (amount) -> (method) -> ->

  value = method.apply @, arguments

  if value > amount
    amount
  else
    value

class Device

    getValue: roof(50) ->
      parseInt Math.random() * 100


if require.main is module
  device = new Device
  for i in [0..10]
    console.log device.getValue()

