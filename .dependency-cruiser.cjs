/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    /* rules from the template */
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Warn about circular dependencies.',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-orphans',
      comment: 'Orphaned modules are probably dead code.',
      severity: 'warn',
      from: { orphan: true },
      to: {}
    },
    /* EPIOS Architecture Rules */
    {
      name: 'domain-no-infrastructure',
      comment: 'The domain package is the core and MUST NOT depend on infrastructure, api, or application layers.',
      severity: 'error',
      from: { path: '^packages/domain' },
      to: {
        path: [
          '^packages/infrastructure',
          '^packages/api',
          '^packages/application'
        ]
      }
    },
    {
      name: 'domain-independence-general',
      comment: 'The domain package should only depend on observability or external libraries.',
      severity: 'error',
      from: { path: '^packages/domain' },
      to: {
        pathNot: [
          '^packages/domain',
          '^packages/observability',
          'node_modules'
        ]
      }
    },
    {
      name: 'ports-independence',
      comment: 'Ports should only depend on domain or observability.',
      severity: 'error',
      from: { path: '^packages/ports' },
      to: {
        pathNot: [
          '^packages/ports',
          '^packages/domain',
          '^packages/observability',
          'node_modules'
        ]
      }
    },
    {
      name: 'application-boundaries',
      comment: 'Application layer should not depend on API or Infrastructure.',
      severity: 'error',
      from: { 
        path: '^packages/application',
        pathNot: '^packages/application/test'
      },
      to: {
        path: [
          '^packages/api',
          '^packages/infrastructure'
        ]
      }
    },
    {
      name: 'infrastructure-boundaries',
      comment: 'Infrastructure should not depend on API or Application layers.',
      severity: 'error',
      from: { path: '^packages/infrastructure' },
      to: {
        path: [
          '^packages/api',
          '^packages/application'
        ]
      }
    },
    {
      name: 'no-external-to-internal-apps',
      comment: 'Apps should depend on the public API layer (packages/api), not directly on domain/application/infrastructure if we want to enforce strict layering.',
      severity: 'error',
      from: { path: '^apps/' },
      to: {
        path: [
          '^packages/domain',
          '^packages/application',
          '^packages/infrastructure'
        ]
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules|dist|coverage'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.base.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+'
      },
      archi: {
        collapsePattern: '^(packages|apps|libs|src|lib|bin|test|spec|quack|unit|int|eff|perf|sh)/[^/]+'
      }
    }
  }
};
