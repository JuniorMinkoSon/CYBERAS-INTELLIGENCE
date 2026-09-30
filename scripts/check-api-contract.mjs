#!/usr/bin/env node
/**
 * Contrôle de contrat : tout appel HTTP du frontend doit viser un endpoint
 * qui existe réellement côté Quarkus.
 *
 * Le besoin vient d'une classe de panne qui ne se voit ni à la compilation ni
 * au lint : `apiClient.get('/audits/' + id + '/questionnaire')` est du
 * TypeScript valide même si la ressource JAX-RS s'appelle « questionnaires ».
 * La rupture n'apparaît qu'au clic, en démonstration, sous la forme d'un 404
 * que l'écran présente comme « aucune donnée ».
 *
 * Méthode : les chemins sont extraits des deux côtés, réduits à une forme
 * comparable (les segments variables deviennent « {} », la chaîne de requête
 * tombe), puis confrontés. Un appel frontend sans endpoint correspondant est
 * une erreur ; un endpoint jamais appelé est signalé sans faire échouer —
 * c'est du backend en avance sur l'interface, pas un défaut.
 *
 * Usage : node scripts/check-api-contract.mjs [--verbose]
 * Sortie : 0 si aucun appel orphelin, 1 sinon.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const FRONT = join(ROOT, 'frontend', 'src')
const BACK = join(ROOT, 'src', 'main', 'java', 'com', 'cyberas', 'api', 'resource')
const VERBOSE = process.argv.includes('--verbose')

function walk(dir, filter, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, filter, out)
    else if (filter(entry)) out.push(full)
  }
  return out
}

/**
 * Forme comparable d'un chemin.
 *
 * Un segment est variable dès qu'il contient une interpolation, un opérateur
 * ou une majuscule isolée de variable : `${auditId}` côté TypeScript et
 * `{auditId}` côté JAX-RS désignent la même position et doivent se confondre,
 * sinon le contrôle signalerait des ruptures qui n'existent pas.
 */
function normalize(path) {
  return path
    .replace(/\?.*$/, '')
    .split('/')
    .map((seg) => (/\$\{|\{|\}|\+|encodeURIComponent/.test(seg) ? '{}' : seg))
    .join('/')
    .replace(/\/+$/, '')
}

// --- Côté frontend : les appels passent tous par apiClient. -----------------
const frontCalls = new Map() // chemin normalisé -> fichiers
for (const file of walk(FRONT, (f) => f.endsWith('.ts') || f.endsWith('.tsx'))) {
  const src = readFileSync(file, 'utf8')
  const re = /apiClient\.(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(\s*([`'"])([^`'"]*)\2/g
  let m
  while ((m = re.exec(src)) !== null) {
    const raw = m[3]
    if (!raw.startsWith('/')) continue
    const key = `${m[1].toUpperCase()} ${normalize(raw)}`
    if (!frontCalls.has(key)) frontCalls.set(key, new Set())
    frontCalls.get(key).add(relative(ROOT, file))
  }
}

// --- Côté backend : @Path de classe + @Path de méthode. ---------------------
const backEndpoints = new Set()
for (const file of walk(BACK, (f) => f.endsWith('.java'))) {
  const src = readFileSync(file, 'utf8')
  const classIdx = src.indexOf('public class')
  const classPaths = [...src.slice(0, classIdx).matchAll(/@Path\("([^"]*)"\)/g)]
  const base = classPaths.length ? classPaths[classPaths.length - 1][1] : ''
  // Chaque verbe est suivi, avant la signature, d'un éventuel @Path de méthode.
  const re = /@(GET|POST|PUT|PATCH|DELETE)\b([\s\S]{0,400}?)public\s/g
  let m
  while ((m = re.exec(src)) !== null) {
    const sub = m[2].match(/@Path\("([^"]*)"\)/)
    const full = normalize(`${base}${sub ? sub[1] : ''}`.replace(/\/{2,}/g, '/'))
    backEndpoints.add(`${m[1]} ${full}`)
  }
}

const orphans = [...frontCalls.keys()].filter((k) => !backEndpoints.has(k)).sort()
const unused = [...backEndpoints].filter((k) => !frontCalls.has(k)).sort()

console.log(`Appels frontend  : ${frontCalls.size}`)
console.log(`Endpoints backend: ${backEndpoints.size}`)

if (VERBOSE && unused.length) {
  console.log(`\nEndpoints backend non consommés (${unused.length}) — informatif :`)
  for (const u of unused) console.log(`  · ${u}`)
}

if (orphans.length) {
  console.error(`\nAppels frontend sans endpoint backend (${orphans.length}) :`)
  for (const o of orphans) {
    console.error(`  ✗ ${o}`)
    for (const f of frontCalls.get(o)) console.error(`      ${f}`)
  }
  process.exit(1)
}

console.log('\nAucun appel frontend orphelin.')
