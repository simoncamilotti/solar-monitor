/**
 * OpenTelemetry (ADR 0009): traces and metrics exported over OTLP.
 * Loaded before the application: `node --import ./dist/instrumentation.js dist/main.js`.
 * Disabled unless `OTEL_EXPORTER_OTLP_ENDPOINT` is set; the standard `OTEL_*` variables
 * configure the rest (`OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_HEADERS`…).
 */
import { register } from 'node:module';

if (process.env['OTEL_EXPORTER_OTLP_ENDPOINT']) {
  // Lets the instrumentations patch ES modules, not only CommonJS ones.
  register('@opentelemetry/instrumentation/hook.mjs', import.meta.url);

  const { NodeSDK } = await import('@opentelemetry/sdk-node');
  const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
  const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http');
  const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');
  const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http');
  const { PgInstrumentation } = await import('@opentelemetry/instrumentation-pg');
  const { PinoInstrumentation } = await import('@opentelemetry/instrumentation-pino');
  const { PrismaInstrumentation } = await import('@prisma/instrumentation');

  const sdk = new NodeSDK({
    serviceName: process.env['OTEL_SERVICE_NAME'] ?? 'api',
    traceExporter: new OTLPTraceExporter(),
    metricReaders: [new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter() })],
    instrumentations: [
      new HttpInstrumentation({
        ignoreIncomingRequestHook: (request) => request.url?.startsWith('/api/health') ?? false,
      }),
      new PgInstrumentation(),
      // Adds trace_id and span_id to every log line.
      new PinoInstrumentation(),
      new PrismaInstrumentation(),
    ],
  });
  sdk.start();

  process.once('SIGTERM', () => {
    void sdk.shutdown();
  });
}
