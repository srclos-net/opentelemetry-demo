// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

// Continuous profiling: @pyroscope/nodejs pushes wall/heap profiles to the estate
// Pyroscope when PYROSCOPE_SERVER_ADDRESS is set (deploy/telemetry-env-patches.yaml).
// Loaded via NODE_OPTIONS --require alongside the OpenTelemetry node auto-instrumentation
// (see Dockerfile). Env-guarded and non-fatal so local/estate-less runs stay unchanged.
try {
  const pyroscopeServerAddress = process.env.PYROSCOPE_SERVER_ADDRESS;
  if (pyroscopeServerAddress) {
    const Pyroscope = require('@pyroscope/nodejs');
    Pyroscope.init({
      appName: process.env.OTEL_SERVICE_NAME || 'payment',
      serverAddress: pyroscopeServerAddress,
      basicAuthUser: process.env.PYROSCOPE_BASIC_AUTH_USER,
      basicAuthPassword: process.env.PYROSCOPE_BASIC_AUTH_PASSWORD,
      tags: { service_namespace: 'opentelemetry-demo' },
    });
    Pyroscope.start();
  }
} catch (e) {
  console.warn('pyroscope profiler disabled:', e?.message || e);
}
