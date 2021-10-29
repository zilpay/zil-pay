/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { cubicInOut } from 'svelte/easing';
const duration = 200;
const delay = duration;

const transitionIn = () => ({
  duration,
  delay,
  easing: cubicInOut,
  css: (t: string) => `opacity: ${t}`,
})

const transitionOut = () => ({
  duration,
  delay: 0,
  easing: cubicInOut,
  css: (t: string) => `opacity: ${t}`,
})

export default {
  in: transitionIn,
  out: transitionOut
};
