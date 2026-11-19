import { describe, expect, it } from 'vitest'

const dependencyFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const

const memberManifests = ['../../../package.json', '../package.json', '../../clibind-sdk/package.json'] as const

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const loadDefault = async (relative: string, attributes: ImportCallOptions | undefined): Promise<unknown> => {
  const loaded: unknown = await import(new URL(relative, import.meta.url).href, attributes)
  return isRecord(loaded) ? loaded.default : undefined
}

const loadManifest = async (relative: string): Promise<Readonly<Record<string, unknown>>> => {
  const manifest = await loadDefault(relative, { with: { type: 'json' } })
  if (!isRecord(manifest)) {
    throw new Error(`${relative} is not a JSON object`)
  }
  return manifest
}

const loadNpmrc = async (): Promise<string> => {
  const text = await loadDefault('../../../.npmrc?raw', undefined)
  if (typeof text !== 'string') {
    throw new Error('.npmrc did not load as text')
  }
  return text
}

const scopeOf = (dependency: string): string | undefined =>
  dependency.startsWith('@') ? dependency.slice(0, dependency.indexOf('/')) : undefined

const publicScope = scopeOf('@ai-swfactory-oss/clibind')

const privatelyRoutedScopes = (npmrc: string): ReadonlySet<string> =>
  new Set(
    npmrc
      .split('\n')
      .map(line => /^(@[^:]+):registry=/.exec(line.trim())?.[1])
      .filter((scope): scope is string => scope !== undefined && scope !== publicScope),
  )

const dependencyNames = (manifest: Readonly<Record<string, unknown>>, field: string): readonly string[] => {
  const declared = manifest[field]
  return isRecord(declared) ? Object.keys(declared) : []
}

describe('workspace dependency scopes', () => {
  it('reads every workspace member manifest', async () => {
    const manifests = await Promise.all(memberManifests.map(loadManifest))

    expect(manifests.map(manifest => manifest.name)).toEqual([
      'clibind-monorepo',
      '@ai-swfactory-oss/clibind',
      '@ai-swfactory-oss/clibind-sdk',
    ])
  })

  it('finds the scopes the workspace routes to a private registry', async () => {
    expect(privatelyRoutedScopes(await loadNpmrc()).size).toBeGreaterThan(0)
  })

  it('names no package from a private scope in any dependency field of any workspace member', async () => {
    const privateScopes = privatelyRoutedScopes(await loadNpmrc())
    const manifests = await Promise.all(memberManifests.map(loadManifest))

    const offending = manifests.flatMap(manifest =>
      dependencyFields.flatMap(field =>
        dependencyNames(manifest, field)
          .filter(dependency => {
            const scope = scopeOf(dependency)
            return scope !== undefined && privateScopes.has(scope)
          })
          .map(dependency => `${String(manifest.name)} ${field} ${dependency}`),
      ),
    )

    expect(offending).toEqual([])
  })
})
