# Baseline Performance Metrics – Retro Game High Score Wall

## Before Fixes

- Payload size: 618 KB (measured with curl)

- Response time: 820 ms (measured with curl)

- API calls on mount: 2 (counted in DevTools Network tab)

- React commit duration (typing): 45 ms (DevTools Performance tab)

- DOM nodes (initial): 3200 (document.querySelectorAll('*').length)

## After Fixes

- Payload size: 0.7 KB

- Response time: 15 ms

- API calls on mount: 1

- React commit duration (typing): 1.5 ms

- DOM nodes (initial): 220

## Improvements Summary

- Payload reduced by 99.9% (from 618 KB to 0.7 KB)

- Response time improved by 98.2% (from 820 ms to 15 ms)

- API calls reduced from 2 to 1 on mount

- Typing lag eliminated (commit from 45 ms to 1.5 ms)

- DOM node count reduced from 3200 to 220
