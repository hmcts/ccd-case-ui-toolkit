// tslint:disable: ordered-imports

// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'zone.js';
import 'zone.js/testing';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Preserve the existing Zone.js test behavior when TestBed defaults to zoneless.
@NgModule({ providers: [provideZoneChangeDetection()] })
class ZoneTestModule {}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  [BrowserDynamicTestingModule, ZoneTestModule],
  platformBrowserDynamicTesting()
);
(window as any).process = { env: { DEBUG: undefined } };
