// src/pages/LandingPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Rocket, Info, Telescope, Orbit, Radio, Waves, Scan, Sparkles, ArrowRight,
} from 'lucide-react'

// dev uses proxy (/TAP), prod calls directly
const TAP = import.meta.env.DEV
  ? "/TAP/sync"
  : "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"

async function tap(query) {
  const url = `${TAP}?query=${encodeURIComponent(query)}&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TAP error: ${res.status}`)
  return res.json()
}

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('pt-BR') : '—')

export default function LandingPage() {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [data, setData] = useState({
    confirmed: null,
    tessPC: null,
    tessCP: null,
    transitingObserved: null,
    methodTransit: null,
    methodRV: null,
    methodImaging: null,
    methodMicrolensing: null,
    keplerConfirmed: null,
    k2Confirmed: null,
    asOf: new Date(),
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setErr(null)

        const [
          confirmed,
          tessPC,
          tessCP,
          transitingObserved,
          methodRows,
          keplerConfirmed,
          k2Confirmed,
        ] = await Promise.all([
          tap('select count(*) as n from ps'),
          tap("select count(*) as n from toi where tfopwg_disp = 'PC'"),
          tap("select count(*) as n from toi where tfopwg_disp = 'CP'"),
          tap('select count(*) as n from ps where tran_flag = 1'),
          tap('select discoverymethod as m, count(*) as n from ps group by discoverymethod'),
          tap("select count(*) as n from ps where upper(disc_facility) like '%KEPLER%'"),
          tap("select count(*) as n from ps where upper(disc_facility) like '%K2%'"),
        ])

        const byMethod = (needle) =>
          methodRows.find((r) => (r.m || '').toLowerCase().includes(needle))?.n ?? 0

        if (!cancelled) {
          setData({
            confirmed: Number(confirmed?.[0]?.n ?? 0),
            tessPC: Number(tessPC?.[0]?.n ?? 0),
            tessCP: Number(tessCP?.[0]?.n ?? 0),
            transitingObserved: Number(transitingObserved?.[0]?.n ?? 0),
            methodTransit: Number(byMethod('transit')),
            methodRV: Number(byMethod('radial')),
            methodImaging: Number(byMethod('imag')), // pega "Imaging" / "Direct Imaging"
            methodMicrolensing: Number(byMethod('micro')),
            keplerConfirmed: Number(keplerConfirmed?.[0]?.n ?? 0),
            k2Confirmed: Number(k2Confirmed?.[0]?.n ?? 0),
            asOf: new Date(),
          })
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Failed to query API')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const STATS = useMemo(
    () => [
      { label: 'Confirmed Exoplanets', value: fmt(data.confirmed), icon: Telescope },
      { label: 'TESS Candidates', value: fmt(data.tessPC), icon: Scan },
      { label: 'TESS Confirmed', value: fmt(data.tessCP), icon: Orbit },
    ],
    [data]
  )

  const HIGHLIGHTS = useMemo(
    () => [
      { label: 'Transiting (observed)', value: fmt(data.transitingObserved), icon: Waves },
      { label: 'Method: Transit', value: fmt(data.methodTransit), icon: Waves },
      { label: 'Method: Radial Velocity', value: fmt(data.methodRV), icon: Radio },
      { label: 'Direct Imaging', value: fmt(data.methodImaging), icon: Telescope },
      { label: 'Gravitational Microlensing', value: fmt(data.methodMicrolensing), icon: Orbit },
      { label: 'Kepler Confirmados', value: fmt(data.keplerConfirmed), icon: Telescope },
      { label: 'K2 Confirmados', value: fmt(data.k2Confirmed), icon: Telescope },
      { label: '—', value: '—', icon: Scan },
    ],
    [data]
  )

  const asOfStr = useMemo(
    () => data.asOf.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    [data.asOf]
  )

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative w-full min-h-[88vh] overflow-hidden rounded-2xl">
        <img src="/image_bdf04c.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-black/65 [mask-image:radial-gradient(115%_85%_at_50%_40%,transparent_66%,black_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
        </div>

        <div className="mx-auto grid min-h-[88vh] max-w-6xl place-items-center px-6 text-center">
          <div className="w-full max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Exoplanet Hunter
            </span>

            <h1 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight md:leading-[1.1] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,.7)]">
              Explore Exoplanets
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-pink-200 to-orange-200 bg-clip-text text-transparent">
                with Artificial Intelligence
              </span>
            </h1>

            <p className="mt-4 text-lg md:text-xl text-zinc-100/90">
              Classify candidates, view statistics, and understand the techniques that reveal new worlds — inspired by the NASA portal.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild size="lg" className="hover:translate-y-[-1px] transition">
                <Link to="/arquivos">
                  Go to Files <Rocket className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/5 border-white/20 hover:bg-white/10 hover:translate-y-[-1px] transition"
              >
                <Link to="/sobre">
                  Learn more <Info className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="w-full max-w-6xl -mt-12 md:-mt-16 mx-auto px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {STATS.map(({ label, value, icon: Icon }) => (
            <Card
              key={label}
              className="group bg-card/80 backdrop-blur-md border-border/50 hover:bg-card/95 hover:ring-1 hover:ring-white/10 transition"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
                <span className="rounded-full border border-white/10 bg-white/5 p-1.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">
                  {loading ? '—' : value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {err ? 'Failed to query NASA' : `Source: NASA Exoplanet Archive — ${asOfStr}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* MÉTODOS */}
      <section className="w-full max-w-6xl mx-auto px-6 mt-14 md:mt-20">
        <h2 className="text-3xl font-bold tracking-tight text-center">How do we detect exoplanets?</h2>
        <p className="mt-3 text-muted-foreground text-center max-w-3xl mx-auto">
          Each technique sees a different type of world. One combines light; another, gravity. Together, they tell the story.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Transit', desc: 'Periodic dip in brightness as the planet crosses its star (Kepler/TESS).', icon: Waves },
            { title: 'Radial Velocity', desc: 'Doppler shift in spectral lines due to gravitational "pull".', icon: Radio },
            { title: 'Direct Imaging', desc: 'Coronagraphs block starlight to see the planet\'s light.', icon: Telescope },
            { title: 'Gravitational Microlensing', desc: 'Brief amplification of light from a background star.', icon: Orbit },
            { title: 'Transit Timing Variations', desc: 'Timing perturbations indicate additional planets.', icon: Scan },
          ].map(({ title, desc, icon: Icon }) => (
            <Card
              key={title}
              className="bg-card/75 backdrop-blur-md border-border/50 hover:bg-card/95 hover:translate-y-[-2px] hover:ring-1 hover:ring-white/10 transition"
            >
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AÇÕES + MINI CARDS */}
      <section className="w-full max-w-6xl mx-auto px-6 mt-14 md:mt-20">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <Button asChild size="lg" className="hover:translate-y-[-1px] transition">
              <Link to="/arquivos">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/5 border-white/20 hover:bg-white/10 hover:translate-y-[-1px] transition"
            >
              <Link to="/sobre">Learn More</Link>
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {err ? 'Some numbers may be outdated.' : `Updated on ${asOfStr}.`}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Transiting (observed)', value: data.transitingObserved, icon: Waves },
            { label: 'Method: Transit', value: data.methodTransit, icon: Waves },
            { label: 'Method: Radial Velocity', value: data.methodRV, icon: Radio },
            { label: 'Direct image', value: data.methodImaging, icon: Telescope },
            { label: 'Gravitational microlenses', value: data.methodMicrolensing, icon: Orbit },
            { label: 'Confirmed Kepler', value: data.keplerConfirmed, icon: Telescope },
            { label: 'Confirmed K2', value: data.k2Confirmed, icon: Telescope },
          ].map(({ label, value, icon: Icon }) => (
            <Card
              key={label}
              className="bg-card/80 backdrop-blur-md border-border/50 hover:bg-card/95 hover:ring-1 hover:ring-white/10 transition"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{loading ? '—' : fmt(value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
