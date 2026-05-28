'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, Loader2, School, Plus, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClearGradeLogo } from '@/components/cleargrade-logo'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/components/language-provider'

interface Institution {
  id: string
  name: string
}

// Profanity filter - basic list of prohibited words
const PROHIBITED_WORDS = [
  'puta', 'puto', 'mierda', 'verga', 'pendejo', 'pendeja', 'cabron', 'cabrona',
  'chingar', 'chingada', 'culero', 'culera', 'joto', 'jota', 'marica', 'maricon',
  'cojones', 'coño', 'carajo', 'hijueputa', 'malparido', 'gonorrea', 'hp',
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'bastard',
  'whore', 'slut', 'nigger', 'faggot', 'retard'
]

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-záéíóúñü]/g, '')
  return PROHIBITED_WORDS.some(word => lower.includes(word))
}

export default function SignUpPage() {
  const { language } = useLanguage()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Institution state
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loadingInstitutions, setLoadingInstitutions] = useState(true)
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [newInstitutionName, setNewInstitutionName] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [creatingNew, setCreatingNew] = useState(false)
  
  // Grade and section
  const [grade, setGrade] = useState('')
  const [section, setSection] = useState('')

  // Load existing institutions
  useEffect(() => {
    const loadInstitutions = async () => {
      setLoadingInstitutions(true)
      const { data } = await supabase
        .from('institutions')
        .select('id, name')
        .order('name')
      if (data) setInstitutions(data)
      setLoadingInstitutions(false)
    }
    loadInstitutions()
  }, [supabase])

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate profanity in names
    if (containsProfanity(firstName) || containsProfanity(lastName)) {
      setError('El nombre contiene palabras no permitidas')
      return
    }
    
    if (newInstitutionName && containsProfanity(newInstitutionName)) {
      setError('El nombre de la institucion contiene palabras no permitidas')
      return
    }
    
    if (!selectedInstitution && !newInstitutionName.trim()) {
      setError('Por favor selecciona o crea tu institucion')
      return
    }
    
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
          marketing_opt_in: marketingOptIn,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Handle institution - create new or use existing
      let institutionId = selectedInstitution?.id
      
      if (!institutionId && newInstitutionName.trim()) {
        // Check if already exists (case insensitive)
        const { data: existing } = await supabase
          .from('institutions')
          .select('id')
          .ilike('name', newInstitutionName.trim())
          .single()
        
        if (existing) {
          institutionId = existing.id
        } else {
          // Create new institution
          const { data: newInst } = await supabase
            .from('institutions')
            .insert({
              name: newInstitutionName.trim(),
              created_by: data.user.id
            })
            .select('id')
            .single()
          
          if (newInst) institutionId = newInst.id
        }
      }

      // Update profile with institution, grade, section
      await supabase
        .from('profiles')
        .update({
          institution_id: institutionId || null,
          grade: grade || null,
          section: section || null,
        })
        .eq('id', data.user.id)

      // Marketing subscriber
      if (marketingOptIn) {
        await supabase
          .from('marketing_subscribers')
          .insert({
            email: email,
            first_name: firstName,
            last_name: lastName,
            user_id: data.user.id,
            subscribed: true,
          })
      }
    }

    router.push('/auth/sign-up-success')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <ClearGradeLogo size="md" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{language === 'en' ? 'Create account' : language === 'pt' ? 'Criar conta' : 'Crear cuenta'}</h1>
          <p className="text-muted-foreground mt-1">{language === 'en' ? 'Join ClearGrade' : language === 'pt' ? 'Junte-se ao ClearGrade' : 'Unete a ClearGrade'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm animate-scale-in">
              {error}
            </div>
          )}

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                {language === 'en' ? 'First name' : language === 'pt' ? 'Nome' : 'Nombre'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder={language === 'en' ? 'Your name' : language === 'pt' ? 'Seu nome' : 'Tu nombre'}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                {language === 'en' ? 'Last name' : language === 'pt' ? 'Sobrenome' : 'Apellido'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder={language === 'en' ? 'Your last name' : language === 'pt' ? 'Seu sobrenome' : 'Tu apellido'}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Institution Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {language === 'en' ? 'Educational institution' : language === 'pt' ? 'Instituicao educacional' : 'Institucion educativa'}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full h-12 rounded-xl bg-surface-container border border-outline-variant px-3 flex items-center justify-between text-left hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <School className="w-5 h-5 text-muted-foreground" />
                  <span className={selectedInstitution || newInstitutionName ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedInstitution?.name || newInstitutionName || (language === 'en' ? 'Select or create your institution' : language === 'pt' ? 'Selecione ou crie sua instituicao' : 'Selecciona o crea tu institucion')}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  {/* Search */}
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={language === 'en' ? 'Search institution...' : language === 'pt' ? 'Buscar instituicao...' : 'Buscar institucion...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 rounded-lg bg-secondary/50 border-0"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  {/* List */}
                  <div className="max-h-48 overflow-y-auto">
                    {loadingInstitutions ? (
                      <div className="px-4 py-3 text-center text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        {language === 'en' ? 'Loading...' : language === 'pt' ? 'Carregando...' : 'Cargando...'}
                      </div>
                    ) : filteredInstitutions.length > 0 ? (
                      filteredInstitutions.map((inst) => (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={() => {
                            setSelectedInstitution(inst)
                            setNewInstitutionName('')
                            setCreatingNew(false)
                            setShowDropdown(false)
                            setSearchQuery('')
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-center gap-3"
                        >
                          <School className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{inst.name}</span>
                        </button>
                      ))
                    ) : searchQuery ? (
                      <div className="px-4 py-3 text-muted-foreground text-sm text-center">
                        {language === 'en' ? 'No institutions found' : language === 'pt' ? 'Nenhuma instituicao encontrada' : 'No se encontraron instituciones'}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-muted-foreground text-sm text-center">
                        {language === 'en' ? 'No institutions yet' : language === 'pt' ? 'Ainda nao ha instituicoes' : 'No hay instituciones aun'}
                      </div>
                    )}
                  </div>

                  {/* Create new */}
                  <div className="border-t border-border p-2">
                    {creatingNew ? (
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Nombre de tu institucion"
                          value={newInstitutionName}
                          onChange={(e) => setNewInstitutionName(e.target.value)}
                          className="h-10 rounded-lg bg-secondary/50 border-0 flex-1"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (newInstitutionName.trim()) {
                              setSelectedInstitution(null)
                              setShowDropdown(false)
                              setCreatingNew(false)
                              setSearchQuery('')
                            }
                          }}
                          className="rounded-lg px-4"
                          disabled={!newInstitutionName.trim()}
                        >
                          Usar
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCreatingNew(true)}
                        className="w-full px-4 py-2.5 text-left hover:bg-secondary/50 transition-colors flex items-center gap-3 text-primary rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="font-medium">Agregar nueva institucion</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grade and Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="grade" className="text-sm font-medium text-foreground">
                Grado
              </label>
              <Input
                id="grade"
                type="text"
                placeholder="Ej: 11"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="section" className="text-sm font-medium text-foreground">
                Seccion
              </label>
              <Input
                id="section"
                type="text"
                placeholder="Ej: A"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo electronico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Contrasena
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl bg-surface-container border-outline-variant focus:border-primary"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Marketing Opt-in */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="w-5 h-5 rounded mt-0.5 accent-primary"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Recibir novedades y ofertas
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Te enviaremos actualizaciones sobre nuevas features y consejos para estudiantes.
                </p>
              </div>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Crear cuenta'
            )}
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Inicia sesion
          </Link>
        </p>
      </div>
    </main>
  )
}
