// src/pages/Sobre.jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import NerdStats from '@/components/NerdStats' // <— adiciona

export default function Sobre() {
  return (
    <Card className="w-full max-w-6xl mx-auto bg-card/80 backdrop-blur-sm border-border/40 shadow-2xl">
      {/* Header */}
      <CardHeader className="text-center bg-white/5 p-8 border-b border-border/40">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-primary leading-tight tracking-wider">
          Exoplanet Explorer 🔭
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground font-light max-w-2xl mx-auto pt-2">
          Unveiling the secrets of the universe with Artificial Intelligence and a passion for discovery.
        </p>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-8 sm:p-12 space-y-10 text-muted-foreground">
        {/* Sobre o Projeto */}
        <div>
          <h2 className="text-3xl font-bold text-card-foreground mb-4 border-b border-border/40 pb-3">
            About the Project: <span className="text-primary">Exoplanet Explorer</span>
          </h2>
          <div className="space-y-4 text-base sm:text-lg leading-relaxed">
            <p>
              Welcome to our project for the <strong className="text-card-foreground">NASA Space Apps Challenge 2025</strong>! We are a group of Computer Science and Systems Development students, passionate about the vastness of the cosmos and the power of technology.
            </p>
            <p>
              Our project uses <strong className="text-card-foreground">Artificial Intelligence</strong> to automate and enhance the identification of new worlds orbiting distant stars.
            </p>
          </div>
        </div>

        {/* Desafio */}
        <div>
          <h2 className="text-3xl font-bold text-card-foreground mb-4 border-b border-border/40 pb-3">
            The Challenge: Finding Needles in a Cosmic Haystack
          </h2>
          <div className="space-y-4 text-base sm:text-lg leading-relaxed">
            <p>
              Telescopes like Kepler and TESS generate a colossal amount of data by observing the brightness of hundreds of thousands of stars simultaneously (transit method).
            </p>
            <p>
              These signals are subtle and can be confused with noise or stellar effects. Analyzing everything manually is unfeasible — we need to speed up the process without losing accuracy.
            </p>
          </div>
        </div>

        {/* Solução */}
        <div>
          <h2 className="text-3xl font-bold text-card-foreground mb-4 border-b border-border/40 pb-3">
            Our Solution: AI Trained to Hunt Planets
          </h2>
          <div className="space-y-4 text-base sm:text-lg leading-relaxed">
            <p>
              We developed a Machine Learning pipeline to classify signals as candidate, confirmed, or false positive.
            </p>
            <p>Brief workflow:</p>
            <ul className="list-disc list-inside space-y-6 pl-4">
              <li>
                <strong className="text-primary">Data Preparation:</strong> <code className="font-mono bg-muted/70 text-muted-foreground px-2 py-1 rounded-md">pandas</code>, <code className="font-mono bg-muted/70 text-muted-foreground px-2 py-1 rounded-md">StandardScaler</code>, <code className="font-mono bg-muted/70 text-muted-foreground px-2 py-1 rounded-md">LabelEncoder</code>.
              </li>
              <li>
                <strong className="text-primary">Model:</strong> <code className="font-mono bg-muted/70 text-muted-foreground px-2 py-1 rounded-md">VotingClassifier</code> combining
                <ul className="list-disc list-inside ml-6 mt-2 space-y-2 text-base">
                  <li><code className="font-mono bg-muted/70 text-muted-foreground px-2 py-1 rounded-md">LogisticRegression</code></li>
                  <li><code className="font-mono bg-muted/70 text-muted-foreground px-2 py-1 rounded-md">KNeighborsClassifier</code></li>
                  <li><code className="font-mono bg-muted/70 text-muted-foreground px-2 py-1 rounded-md">RandomForestClassifier</code></li>
                </ul>
              </li>
              <li>
                <strong className="text-primary">Validation:</strong> <code className="font-mono bg-muted/70 text-muted-foreground px-2 py-1 rounded-md">accuracy_score</code>, <code className="font-mono bg-muted/70 text-muted-foreground px-2 py-1 rounded-md">classification_report</code>, export with <code className="font-mono bg-muted/70 text-muted-foreground px-2 py-1 rounded-md">joblib</code>.
              </li>
            </ul>
          </div>
        </div>

        {/* —— ESTATÍSTICAS PARA NERDS —— */}
        <div>
          <h2 className="text-3xl font-bold text-card-foreground mb-4 border-b border-border/40 pb-3">
            Model Performance (Nerd Stats)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Live metrics pulled from <code className="font-mono">GET /stats</code> when your API is running.
          </p>
          <NerdStats className="w-full" />
        </div>

        {/* Quem Somos */}
        <div>
          <h2 className="text-3xl font-bold text-card-foreground mb-4 border-b border-border/40 pb-3">
            Who We Are
          </h2>
          <p className="text-base sm:text-lg leading-relaxed">
            A team of curious students, focused on applying AI to real-world — and cosmic — problems.
          </p>
        </div>
      </CardContent>

      {/* Footer */}
      <footer className="text-center p-6 bg-white/5 border-t border-border/40 text-muted-foreground text-sm">
        <p>&copy; 2025 Exoplanet Explorer Team - NASA Space Apps Challenge</p>
      </footer>
    </Card>
  )
}
