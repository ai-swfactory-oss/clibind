import { describe, expect, it } from 'vitest'

const dependencyFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const

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

const loadText = async (relative: string): Promise<string> => {
  const text = await loadDefault(`${relative}?raw`, undefined)
  if (typeof text !== 'string') {
    throw new Error(`${relative} did not load as text`)
  }
  return text
}

const loadNpmrc = async (): Promise<string> => loadText('../../../.npmrc')

const declaredPackages = async (): Promise<readonly string[]> => {
  const declared = (await loadManifest('../../../.panoptic.json')).packages
  return isRecord(declared) ? Object.keys(declared) : []
}

const memberDirectory = (name: string): string => `packages/${name.slice(name.indexOf('/') + 1)}`

const loadMemberManifests = async (): Promise<readonly Readonly<Record<string, unknown>>[]> => {
  const members = (await declaredPackages()).map(name => `../../../${memberDirectory(name)}/package.json`)
  return Promise.all(['../../../package.json', ...members].map(loadManifest))
}

const workspacePatterns = async (): Promise<readonly string[]> =>
  (await loadText('../../../pnpm-workspace.yaml'))
    .split('\n')
    .map(line => /^\s*-\s*['"]?([^'"\s]+)['"]?\s*$/.exec(line)?.[1])
    .filter((pattern): pattern is string => pattern !== undefined)

const matchesPattern = (directory: string, pattern: string): boolean => {
  const segments = directory.split('/')
  const parts = pattern.split('/')
  return segments.length === parts.length && parts.every((part, index) => part === '*' || part === segments[index])
}

const repositoryDirectory = (manifest: Readonly<Record<string, unknown>>): string => {
  const repository = manifest.repository
  return isRecord(repository) && typeof repository.directory === 'string' ? repository.directory : String(manifest.name)
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
    const manifests = await loadMemberManifests()

    expect(manifests.map(manifest => manifest.name)).toEqual(['clibind-monorepo', ...(await declaredPackages())])
  })

  it('checks the manifest of every package the workspace declares', async () => {
    const checked = (await loadMemberManifests()).map(manifest => manifest.name)

    expect((await declaredPackages()).filter(name => !checked.includes(name))).toEqual([])
  })

  it('reads each member manifest from a directory the pnpm workspace declares', async () => {
    const patterns = await workspacePatterns()
    const directories = (await loadMemberManifests()).slice(1).map(repositoryDirectory)

    expect(patterns.length).toBeGreaterThan(0)
    expect(directories.filter(directory => !patterns.some(pattern => matchesPattern(directory, pattern)))).toEqual([])
  })

  it('names every package the workspace declares in the README', async () => {
    const readme = await loadText('../../../README.md')

    expect((await declaredPackages()).filter(name => !readme.includes(`\`${name}\``))).toEqual([])
  })

  it('finds the scopes the workspace routes to a private registry', async () => {
    expect(privatelyRoutedScopes(await loadNpmrc()).size).toBeGreaterThan(0)
  })

  it('names no package from a private scope in any dependency field of any workspace member', async () => {
    const privateScopes = privatelyRoutedScopes(await loadNpmrc())
    const manifests = await loadMemberManifests()

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
