const express = require('express');
const path = require('path');
const { verifyToken } = require('../middleware/auth.middleware');
const { Client, Plug, Bulb } = require('tplink-smarthome-api');

const router = express.Router();
const client = new Client();

let kl130Bulb = null;

client.startDiscovery().on('device-new', function (device) {
  if ('lighting' in device && device.model && device.model.startsWith('KL130')) {
    console.log('Discovered KL130 bulb:', device.alias);
    kl130Bulb = device;
    client.stopDiscovery();
  }
});

router.get('/colors', verifyToken, async function (req, res) {
    console.log('colors hit');
  if (!kl130Bulb) {
    res.status(404).send({ message: 'KL130 bulb not found' });
    return;
  }

  if ('lighting' in kl130Bulb && kl130Bulb.model === 'KL130(UN)') {
    try {
      const state = await kl130Bulb.lighting.getLightState();

      res.send({
        power: state.on_off === 1 ? 'on' : 'off',
        on: state.on_off === 1,
        hue: state.hue,
        saturation: state.saturation,
        brightness: state.brightness,
        color_temp: state.color_temp,
        mode: state.color_temp === 0 ? 'color' : 'white',
      });
    } catch (err) {
      console.error('Failed to fetch bulb state:', err);
      res.status(500).send({ message: 'Failed to fetch bulb state' });
    }
  } else {
    res.status(400).send({ message: 'Bulb does not support lighting features' });
  }
});

router.post('/colors', verifyToken, async function (req, res) {
  if (!kl130Bulb) {
    res.status(404).send({ message: 'KL130 bulb not found' });
    return;
  }

  var hue = Math.min(Math.max(req.body.hue, 0), 360);
  var saturation = Math.min(Math.max(req.body.saturation, 0), 100);
  var brightness = Math.min(Math.max(req.body.brightness, 0), 100);
  var on = req.body.on === true;

  var responded = false;

  var discoveryTimeout = setTimeout(function () {
    client.stopDiscovery();
    if (!responded) {
      responded = true;
      res.status(504).send({ message: 'Device not found in time' });
    }
  }, 15000);

  console.log('Device was found:', kl130Bulb.model, kl130Bulb.alias);

  if ('lighting' in kl130Bulb && kl130Bulb.model === 'KL130(UN)') {
    clearTimeout(discoveryTimeout);
    client.stopDiscovery();

    try {
      var state = await kl130Bulb.lighting.getLightState();
      console.log('Current light state:', state);

      await kl130Bulb.lighting.setLightState({ on_off: on ? 1 : 0 });
      console.log('Sending hue, saturation, brightness:', hue, saturation, brightness);

      await kl130Bulb.lighting.setLightState({ brightness: brightness });
      await kl130Bulb.lighting.setLightState({
        hue: hue,
        saturation: saturation,
        color_temp: 0,
      });

      if (!responded) {
        responded = true;
        res.send({ status: 'Color updated successfully' });
      }
    } catch (err) {
      console.error('Failed to control bulb:', err);
      if (!responded) {
        responded = true;
        res.status(500).send({ message: 'Failed to control bulb' });
      }
    }
  }
});

router.post('/hue-grinder', verifyToken, async function (req, res) {
  var minHue = req.body.minHue || 0;
  var maxHue = req.body.maxHue || 360;
  var intervalMs = req.body.intervalMs || 500;
  var step = req.body.step || 10;
  var durationMs = req.body.durationMs || 30000;

  if (minHue >= maxHue) {
    res.status(400).send({ message: 'Invalid hue range' });
    return;
  }

  if (!kl130Bulb) {
    res.status(503).send({ message: 'KL130 bulb not available yet. Try again shortly.' });
    return;
  }

  var currentHue = minHue;
  var direction = 1;

  var grinderInterval = setInterval(function () {
    kl130Bulb.lighting.setLightState({
      hue: currentHue,
      saturation: 100,
      brightness: 100,
      color_temp: 0,
      on_off: 1,
    }).catch(function (err) {
      console.error('Failed to set hue:', err);
    });

    currentHue += direction * step;
    if (currentHue >= maxHue || currentHue <= minHue) {
      direction *= -1;
      currentHue = Math.max(minHue, Math.min(maxHue, currentHue));
    }
  }, intervalMs);

  setTimeout(function () {
    clearInterval(grinderInterval);
    console.log('Hue grinder stopped');
  }, durationMs);

  res.send({ status: 'Hue grinder started' });
});

module.exports = router;