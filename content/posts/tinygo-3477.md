---
title: machine.PinInputPullup Does Not Work on Some GPIO Pins
slug: tinygo-3477
date: 2026-08-11T04:11:00Z
draft: false
toc:
  show: true
  open: true
ShowRelatedContent: false
description: How I fixed a tiny issue in TinyGo.
summary: I made a tiny pull request to fix a tiny issue in TinyGo. This article walks through how I reproduced and fixed the issue.
tags:
  - iot
  - software engineering
  - tinygo
categories:
  - IoT
series: []
aliases: []
cover:
  image: /images/tinygo-3477/tiny-gopher-banner.jpg
  alt: A cute, tiny gopher.
  caption: Thank you for reading this post. Your reward is this cute, tiny gopher.
  relative: false
fmContentType: Post (default)
---

Ever since I started using Go, I have been finding excuses to use it everywhere. Fortunately, enough Gophers feel the same, and I was able to use Go everywhere.

I discovered [TinyGo](https://tinygo.org) while working on [WebAssembly](/posts/tiny-apisix-plugin/) [plugins](/posts/tinier-apisix-plugin/) [for Apache APISIX](/posts/apisix-wasm-support/). I can write proxy-agnostic plugins, and that too in Go instead of Lua or, God forbid, C/C++? _Consider me sold_.

TinyGo was built to compile Go for embedded devices. I started taking programming seriously after I discovered microcontrollers and Arduino. When I was a teenager, I realized that I don’t have to get a specific comparator ([LM393](https://www.ti.com/product/LM393) is etched into my brain) to compare voltages, and instead I can just write an `if` statement with the `<` operator. My transition from analog to digital electronics snowballed into a career of writing code.

So it is fair to say, life is coming full circle now. Overwhelmed by LLMs at my day job, where I don’t read the code anymore (as expected of me), I decided to go back to real engineering and got myself an [ESP32 board](https://www.espressif.com/en/products/socs/esp32) to play with. Apparently this is the new AI-driven [midlife](https://x.com/hot_town/status/2084234686927147089) [crisis](https://x.com/ferminrp/status/2084405038743744966) [for nerds](https://x.com/ardchain/status/2080647272988127720) like me.

After I set up the board and got that initial release of dopamine from the “hello world!” of electronics—blinking the onboard LED—I was hooked. I was ambitious. I wanted to design circuit boards and churn out 3D-printed cases. I wanted to take back the joy of building that LLMs stole from me (or I voluntarily surrendered).

I wanted to play with the WiFi and Bluetooth capabilities in the ESP32 board and build something cool. I checked the [latest TinyGo release](https://tinygo.org/blog/2026/tinygo-0-41-the-big-release/), and they had just added a lot of support for these exact capabilities in the ESP32. _Clearly a divine intervention_.

A broader goal was to learn more about low-level, embedded hardware programming. Maybe I will be able to contribute to TinyGo. Maybe I will be able to fix some bugs, or even write drivers for obscure components, and all the while learn how this works.

I decided to check the open issues to see if I could fix anything while I wait for all the components to show up (I just had the ESP32 and a breadboard and some wires; I hate moving), and that’s when I found the titular “[machine.PinInputPullup Does Not Work on Some GPIO Pins](https://github.com/tinygo-org/tinygo/issues/3477)” issue.

## Issue #3477

Issue #3477 was opened three years ago and had a clear description:

{{< blockquote author="bxparks" link="https://github.com/tinygo-org/tinygo/issues/3477" title="tinygo-org/tinygo #3477" >}}
Several GPIO pins on the ESP32 do not work with `machine.PinInputPullup`. It seems like they are configured as `PinInput` instead. These same pins do work in `INPUT_PULLUP` mode in C++ under the ESP32 Arduino Core.

The problem GPIO pins are `GPIO32`, `GPIO33`, `GPIO25`, `GPIO26`, `GPIO27`, `GPIO12`, `GPIO13`, `GPIO4`, and `GPIO2`.
{{< /blockquote >}}

The issue said that internal pull-up resistors for these listed GPIO pins do not work after setting [`machine.PinInputPullup`](https://tinygo.org/docs/reference/machine/). There were also a couple more comments in the issue thread, which I will get to later, and a spam comment (clearly [AI-generated spam](/posts/ai-generated-spam-prs/)).

## Reproducing the Issue

The issue description also had the code to reproduce the issue:

```go
package main

import (
	"machine"
	"time"
)

const pin = machine.GPIO13

func main() {
	pin.Configure(machine.PinConfig{Mode: machine.PinInputPullup})

	time.Sleep(time.Millisecond * 500)
	print("Reading pin #", pin, ": ")

	for {
		value := pin.Get()
		if value {
			print("1")
		} else {
			print("0")
		}
		time.Sleep(time.Millisecond * 100)
	}
}
```

I ran this on my ESP32 and, in addition to the diagnosis from `pin.Get()`, I checked the voltages on these pins. The pull-up resistors were not working. The signal should be high (and `pin.Get()` should be showing `1`) with the pull-up resistor enabled, but it was otherwise.

My first hunch was that perhaps these pins did not have pull-up resistors at all. I looked at the [datasheet for ESP32](https://documentation.espressif.com/esp32_datasheet_en.pdf) and found this nested in Appendix A.1:

{{< blockquote author="Espressif Systems" link="https://documentation.espressif.com/esp32_datasheet_en.pdf" title="ESP32 Series Datasheet v5.3" >}}
GPIO pins 34-39 are input-only. These pins do not feature an output driver or internal pull-up/pull-down circuitry.
{{< /blockquote >}}

If they explicitly mention that GPIO pins 34-39 don’t have pull-up/pull-down resistors, it must mean that the rest of the GPIO pins do. That seemed to be a reasonable assumption.

I wrote a small test script to go through all the other GPIO pins to see which worked and which didn’t:

```go
package main

import (
	"machine"
	"time"
)

var pins = []machine.Pin{19, 21, 22, 23, 4, 12, 13, 14, 15, 25, 26, 27, 32, 33}

func read(p machine.Pin, mode machine.PinMode) bool {
	p.Configure(machine.PinConfig{Mode: mode})
	time.Sleep(20 * time.Millisecond)
	return p.Get()
}

func main() {
	time.Sleep(2 * time.Second)
	for {
		println("pin pullup pulldown pass")
		pass := 0
		for _, p := range pins {
			up := read(p, machine.PinInputPullup)
			down := read(p, machine.PinInputPulldown)
			ok := up && !down
			if ok {
				pass++
			}
			println(int(p), up, down, ok)
		}
		println("passed", pass, "of", len(pins))
		println()
		time.Sleep(3 * time.Second)
	}
}
```

And as reported, only four of the fourteen pins had working pull-up/pull-down mechanisms:

```text
pin pullup pulldown pass
19 true false true
21 true false true
22 true false true
23 true false true
4 false false false
12 false false false
13 false false false
14 true true false
15 true true false
25 false false false
26 false false false
27 false false false
32 false false false
33 false false false
passed 4 of 14
```

With this data, I could summarize that `pin.Configure()` does indeed work as it worked for those four pins. _Unless I missed something._

## What Am I Missing?

I started by looking at the `pin.Configure()` function. It wraps around this function:

```go {hl_lines=["17-21"], title="src/machine/machine_esp32.go"}
func (p Pin) configure(config PinConfig, signal uint32) {
	// ...

	var muxConfig uint32 // The mux configuration.

	// Configure this pin as a GPIO pin.
	const function = 3 // function 3 is GPIO for every pin
	muxConfig |= (function - 1) << esp.IO_MUX_GPIO0_MCU_SEL_Pos

	// Make this pin an input pin (always).
	muxConfig |= esp.IO_MUX_GPIO0_FUN_IE

	// Set drive strength: 0 is lowest, 3 is highest.
	muxConfig |= 2 << esp.IO_MUX_GPIO0_FUN_DRV_Pos

	// Select pull mode.
	if config.Mode == PinInputPullup {
		muxConfig |= esp.IO_MUX_GPIO0_FUN_WPU
	} else if config.Mode == PinInputPulldown {
		muxConfig |= esp.IO_MUX_GPIO0_FUN_WPD
	}

	// Configure the pad with the given IO mux configuration.
	p.mux().Set(muxConfig)

	// ...
}
```

Each pin has one 32-bit "IO MUX" config register. The above function builds up each bit in the register and writes it in one shot. In the highlighted lines, it sets the `IO_MUX_GPIO0_FUN_WPU` and `IO_MUX_GPIO0_FUN_WPD` bits for pull-up or pull-down respectively depending on the configuration.

The important find here, or what I did not find here, is any special handling for the four pins that worked. I hit a dead end. Fortunately a comment on the issue thread gave me a direction to explore:

{{< blockquote author="aykevl" link="https://github.com/tinygo-org/tinygo/issues/3477#issuecomment-1529839076" title="tinygo-org/tinygo #3477 (comment)" >}}
My assumption would be that the pin is incorrectly configured somehow and there is another register that needs to be set correctly.
{{< /blockquote >}}

Another register? I had no clue what this meant, so I went to the datasheet again. Something like this must be documented in the datasheet.

And sure enough, I found the pin overview table (Table 2-1), which gave some hints into what might be happening. I lined up the pins where the pull-up/pull-down resistors worked against the ones that failed:

{{< rawhtml >}}
<style>
#pin-table.is-revealed .rtc-fn {
    color: var(--inline-code-bg);
}
.rtc-reveal {
    box-shadow: 0 1px 0;
}
.rtc-reveal[aria-pressed="false"] .rtc-reveal-hide,
.rtc-reveal[aria-pressed="true"] .rtc-reveal-show {
    display: none;
}
@media (hover: hover) {
    .rtc-reveal:hover {
        color: var(--secondary);
    }
}
</style>
<table id="pin-table">
<thead>
<tr><th>Name</th><th>No.</th><th>Type</th><th>Function</th><th>Pull works?</th></tr>
</thead>
<tbody>
<tr><td>GPIO22</td><td>39</td><td>I/O</td><td>GPIO22, U0RTS, VSPIWP, EMAC_TXD1</td><td>Yes</td></tr>
<tr><td>GPIO19</td><td>38</td><td>I/O</td><td>GPIO19, U0CTS, VSPIQ, EMAC_TXD0</td><td>Yes</td></tr>
<tr><td>GPIO21</td><td>42</td><td>I/O</td><td>GPIO21, VSPIHD, EMAC_TX_EN</td><td>Yes</td></tr>
<tr><td>GPIO23</td><td>36</td><td>I/O</td><td>GPIO23, HS1_STROBE, VSPID</td><td>Yes</td></tr>
</tbody>
<tbody>
<tr><td>GPIO4</td><td>24</td><td>I/O</td><td>GPIO4, ADC2_CH0, <span class="rtc-fn">RTC_GPIO10</span>, TOUCH0, EMAC_TX_ER</td><td>No</td></tr>
<tr><td>GPIO25</td><td>14</td><td>I/O</td><td>GPIO25, ADC2_CH8, <span class="rtc-fn">RTC_GPIO6</span>, DAC_1, EMAC_RXD0</td><td>No</td></tr>
<tr><td>GPIO26</td><td>15</td><td>I/O</td><td>GPIO26, ADC2_CH9, <span class="rtc-fn">RTC_GPIO7</span>, DAC_2, EMAC_RXD1</td><td>No</td></tr>
<tr><td>GPIO32</td><td>12</td><td>I/O</td><td>GPIO32, ADC1_CH4, <span class="rtc-fn">RTC_GPIO9</span>, TOUCH9, 32K_XP</td><td>No</td></tr>
<tr><td>GPIO33</td><td>13</td><td>I/O</td><td>GPIO33, ADC1_CH5, <span class="rtc-fn">RTC_GPIO8</span>, TOUCH8, 32K_XN</td><td>No</td></tr>
</tbody>
</table>
<p>Now, I was pretty proud of my sleuthing here, so I won’t rob you of a chance. <em>What do the failing pins have in common that no working pins have?</em> <button type="button" class="rtc-reveal" id="rtc-reveal" aria-controls="pin-table" aria-pressed="false"><span class="rtc-reveal-show"><svg class="inline-icon" height="12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0.75 13.5 10.5"><path d="M6.75 0.75c-1.894 0 -3.41 0.862 -4.514 1.889 -1.097 1.02 -1.83 2.236 -2.18 3.073 -0.077 0.185 -0.077 0.391 0 0.577 0.349 0.837 1.083 2.055 2.18 3.073C3.34 10.385 4.856 11.25 6.75 11.25s3.41 -0.862 4.514 -1.889c1.097 -1.02 1.83 -2.236 2.18 -3.073 0.077 -0.185 0.077 -0.391 0 -0.577 -0.349 -0.837 -1.083 -2.055 -2.18 -3.073C10.16 1.615 8.644 0.75 6.75 0.75M3.375 6a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 1 1 -6.75 0m3.375 -1.5c0 0.827 -0.673 1.5 -1.5 1.5 -0.27 0 -0.523 -0.07 -0.743 -0.197 -0.023 0.255 -0.002 0.518 0.068 0.778 0.321 1.2 1.556 1.912 2.756 1.591s1.912 -1.556 1.591 -2.756c-0.286 -1.071 -1.301 -1.753 -2.37 -1.659 0.124 0.218 0.197 0.471 0.197 0.743"></path></svg> Reveal</span><span class="rtc-reveal-hide"><svg class="inline-icon" height="12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.75 13.5 13.5"><path d="M0.961 -0.584c-0.22 -0.22 -0.577 -0.22 -0.795 0S-0.054 -0.007 0.164 0.213l12.375 12.375c0.22 0.22 0.577 0.22 0.795 0s0.22 -0.577 0 -0.795l-2.259 -2.259c0.063 -0.056 0.127 -0.112 0.188 -0.169 1.097 -1.02 1.83 -2.236 2.18 -3.073 0.077 -0.185 0.077 -0.391 0 -0.577 -0.349 -0.837 -1.083 -2.055 -2.18 -3.073 -1.104 -1.024 -2.62 -1.889 -4.514 -1.889 -1.331 0 -2.475 0.427 -3.422 1.036zm3.832 3.834C5.344 2.857 6.021 2.625 6.75 2.625c1.863 0 3.375 1.512 3.375 3.375 0 0.729 -0.232 1.404 -0.626 1.957l-0.813 -0.813c0.298 -0.502 0.398 -1.118 0.237 -1.727 -0.321 -1.2 -1.556 -1.912 -2.756 -1.591 -0.202 0.054 -0.391 0.134 -0.563 0.234l-0.813 -0.813zm2.831 6.009c-0.279 0.075 -0.572 0.115 -0.874 0.115 -1.863 0 -3.375 -1.512 -3.375 -3.375 0 -0.302 0.04 -0.595 0.115 -0.874l-1.863 -1.863C0.862 4.125 0.338 5.039 0.059 5.712c-0.077 0.185 -0.077 0.391 0 0.577 0.349 0.837 1.083 2.055 2.18 3.073 1.104 1.024 2.62 1.889 4.514 1.889 0.874 0 1.669 -0.185 2.379 -0.483l-1.505 -1.505z"></path></svg> Hide</span></button></p>
<script>
(() => {
  const table = document.getElementById('pin-table');
  const button = document.getElementById('rtc-reveal');

  button.addEventListener('click', () => {
    const revealed = table.classList.toggle('is-revealed');
    button.setAttribute('aria-pressed', revealed);
  });
})();
</script>
{{< /rawhtml >}}

On top of the GPIO function, all these pins seem to have other functions. But all failing pins have an `RTC_GPIO` function while none of the working ones do. _Surely that’s not a coincidence?_

The issue had mentioned that the pull-up resistor worked with the ESP32 Arduino Core. So it is a TinyGo issue. The comment on the issue had mentioned another register might be controlling the pull-up resistors.

I found comments in the TinyGo codebase mentioning the [official ESP-IDF SDK](https://github.com/espressif/esp-idf). After all, TinyGo is trying to do the exact same thing to the exact same hardware as the ESP-IDF SDK. _Does it do anything different here?_

## Source Code

After some searching, I found the [`gpio_set_pull_mode()`](https://github.com/espressif/esp-idf/blob/08e0d30a74ad0bfd5a34933142b80f45619ee410/components/esp_driver_gpio/src/gpio.c#L283) function, which seems to be calling `gpio_pullup_en()`:

```c {title="components/esp_driver_gpio/src/gpio.c"}
esp_err_t gpio_set_pull_mode(gpio_num_t gpio_num, gpio_pull_mode_t pull)
{
    // ...
    switch (pull) {
    case GPIO_PULLUP_ONLY:
        gpio_pulldown_dis(gpio_num);
        gpio_pullup_en(gpio_num);
        break;
    // ...
    }
}
```

Nothing interesting there, but inside the [`gpio_pullup_en()`](https://github.com/espressif/esp-idf/blob/08e0d30a74ad0bfd5a34933142b80f45619ee410/components/esp_driver_gpio/src/gpio.c#L87-L104) function, I found this:

```c {title="components/esp_driver_gpio/src/gpio.c"}
esp_err_t gpio_pullup_en(gpio_num_t gpio_num)
{
    GPIO_CHECK(GPIO_IS_VALID_OUTPUT_GPIO(gpio_num), "GPIO number error (input-only pad has no internal PU)", ESP_ERR_INVALID_ARG);

    if (!rtc_gpio_is_valid_gpio(gpio_num) || GPIO_RTCIO_ARE_INDEPENDENT) {
        // ...
        gpio_hal_pullup_en(gpio_context.gpio_hal, gpio_num);
        // ...
    } else {
        rtc_gpio_pullup_en(gpio_num);
    }

    return ESP_OK;
}
```

And there it was. If the pin does not have an RTC function, it enables the pull-up resistor through `gpio_hal_pullup_en()`, which sets the IO MUX bit, like what it did in TinyGo. But in the `else` branch, i.e., if the pin does have an RTC function, it calls `rtc_gpio_pullup_en()`, which is not in TinyGo.

That was the bug. The pull-up resistor needs to be enabled through a different register that was ignored.

The actual register write happens in [`rtcio_ll_pullup_enable()`](https://github.com/espressif/esp-idf/blob/08e0d30a74ad0bfd5a34933142b80f45619ee410/components/esp_hal_gpio/esp32/include/hal/rtc_io_ll.h#L175-L180):

```c {title="components/esp_hal_gpio/esp32/include/hal/rtc_io_ll.h"}
static inline void rtcio_ll_pullup_enable(int rtcio_num)
{
    if (rtc_io_desc[rtcio_num].pullup) {
        SET_PERI_REG_MASK(rtc_io_desc[rtcio_num].reg, rtc_io_desc[rtcio_num].pullup);
    }
}
```

The [`rtc_io_desc`](https://github.com/espressif/esp-idf/blob/08e0d30a74ad0bfd5a34933142b80f45619ee410/components/esp_hal_gpio/esp32/rtc_io_periph.c#L57) lookup table has the map:

```c {title="components/esp_hal_gpio/esp32/rtc_io_periph.c"}
//                     REG                  ...  Pullup               Pulldown             ...  gpio number
{RTC_IO_ADC_PAD_REG,   ...                       0,                   0,                   ...}, //34
// ...
{RTC_IO_PAD_DAC1_REG,  ...  RTC_IO_PDAC1_RUE_M,  RTC_IO_PDAC1_RDE_M,  ...}, //25
{RTC_IO_PAD_DAC2_REG,  ...  RTC_IO_PDAC2_RUE_M,  RTC_IO_PDAC2_RDE_M,  ...}, //26
// ...
```

I also found the "RTC IO MUX Pin Summary" table (6.11-1) in the [ESP32 Technical Reference Manual](https://documentation.espressif.com/esp32_technical_reference_manual_en.pdf). The `rtc_io_desc` lookup table maps perfectly.

For each `RTC_GPIO` pin, we now know which `RTC_IO_*` and which `RUE`/`RDE` bit to set. I added this to TinyGo in [pull request #5578](https://github.com/tinygo-org/tinygo/pull/5578).

## The Fix

The fix mirrors ESP-IDF. The `configure()` function still sets the IO MUX bits as before, but now it also calls a new helper, `configureRTCPull()` that writes the `RTC_IO` registers:

```go {title="src/machine/machine_esp32.go"}
func (p Pin) configure(config PinConfig, signal uint32) {
	// ... existing IO MUX setup
	p.mux().Set(muxConfig)

	// Internal pull resistors for pins with RTC function ignore
	// the IO_MUX_GPIO0_FUN_WPU and IO_MUX_GPIO0_FUN_WPD bits set
	// above and are instead controlled by the RTC_IO registers.
	p.configureRTCPull(config.Mode)
	// ...
}

// configureRTCPull applies the pullup/pulldown setting to a pin.
func (p Pin) configureRTCPull(mode PinMode) {
	var rue, rde uint32
	switch mode {
	case PinInputPullup:
		rue = 1
	case PinInputPulldown:
		rde = 1
	}

	switch p {
	// ...
	case 25:
		esp.RTC_IO.SetPAD_DAC1_PDAC1_RUE(rue)
		esp.RTC_IO.SetPAD_DAC1_PDAC1_RDE(rde)
	case 26:
		esp.RTC_IO.SetPAD_DAC2_PDAC2_RUE(rue)
		esp.RTC_IO.SetPAD_DAC2_PDAC2_RDE(rde)
	// ...
	}
}
```

I’m unsure if this is the right fix. Maybe the maintainers would prefer a less “patchy” fix. But from what I know, this has the least intervention. As an open source maintainer myself, I would prefer such minor fixes over a newcomer proposing a complete overhaul.

I ran the same test script. All the pins passed this time around:

```text
pin pullup pulldown pass
19 true false true
21 true false true
22 true false true
23 true false true
4 true false true
12 true false true
13 true false true
14 true false true
15 true false true
25 true false true
26 true false true
27 true false true
32 true false true
33 true false true
passed 14 of 14
```
