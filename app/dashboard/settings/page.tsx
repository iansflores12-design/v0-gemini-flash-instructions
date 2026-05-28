'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Palette, Lock, X, School, ChevronDown, Search, Plus, Loader2, Save, Globe, Mail, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Institution {
  id: string
  name: string
}

export default function SettingsPage() {
  const { 
    theme, 
    setTheme, 
    darkMode, 
    setDarkMode, 
    themes = [], 
    customColor: activeCustomColor, 
    setCustomColor: applyCustomColor 
  } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const ui = {
    es: {
      title: 'Configuracion',
      subtitle: 'Personaliza el estilo de ClearGrade',
      sectionsAria: 'Secciones de ajustes',
      appearance: 'Apariencia',
      security: 'Seguridad',
      colorMode: 'Modo de color',
      presetThemes: 'Temas predefinidos',
      materialCustomization: 'Personalizacion Material',
      quickPresets: 'Presets Rapidos',
      schoolInfo: 'Informacion escolar',
      institutionHelp: 'Tu institucion determina que agendas se comparten contigo',
      institution: 'Institucion educativa',
      selectOrCreateInstitution: 'Selecciona o crea tu institucion',
      searchInstitution: 'Buscar institucion...',
      loading: 'Cargando...',
      noInstitutionsFound: 'No se encontraron instituciones',
      noInstitutionsYet: 'No hay instituciones aun',
      institutionName: 'Nombre de tu institucion',
      use: 'Usar',
      addNewInstitution: 'Agregar nueva institucion',
      grade: 'Grado',
      section: 'Seccion',
      gradeExample: 'Ej: 11',
      sectionExample: 'Ej: A',
      spanish: 'Español',
      english: 'English',
      portuguese: 'Português',
    },
    en: {
      title: 'Settings',
      subtitle: 'Customize ClearGrade style',
      sectionsAria: 'Settings sections',
      appearance: 'Appearance',
      security: 'Security',
      colorMode: 'Color mode',
      presetThemes: 'Preset themes',
      materialCustomization: 'Material customization',
      quickPresets: 'Quick presets',
      schoolInfo: 'School information',
      institutionHelp: 'Your institution determines which schedules are shared with you',
      institution: 'Educational institution',
      selectOrCreateInstitution: 'Select or create your institution',
      searchInstitution: 'Search institution...',
      loading: 'Loading...',
      noInstitutionsFound: 'No institutions found',
      noInstitutionsYet: 'No institutions yet',
      institutionName: 'Institution name',
      use: 'Use',
      addNewInstitution: 'Add new institution',
      grade: 'Grade',
      section: 'Section',
      gradeExample: 'Ex: 11',
      sectionExample: 'Ex: A',
      spanish: 'Spanish',
      english: 'English',
      portuguese: 'Portuguese',
    },
    pt: {
      title: 'Configuracoes',
      subtitle: 'Personalize o estilo do ClearGrade',
      sectionsAria: 'Secoes de ajustes',
      appearance: 'Aparencia',
      security: 'Seguranca',
      colorMode: 'Modo de cor',
      presetThemes: 'Temas predefinidos',
      materialCustomization: 'Personalizacao Material',
      quickPresets: 'Presets Rapidos',
      schoolInfo: 'Informacoes escolares',
      institutionHelp: 'Sua instituicao determina quais cronogramas sao compartilhados com voce',
      institution: 'Instituicao educacional',
      selectOrCreateInstitution: 'Selecione ou crie sua instituicao',
      searchInstitution: 'Buscar instituicao...',
      loading: 'Carregando...',
      noInstitutionsFound: 'Nenhuma instituicao encontrada',
      noInstitutionsYet: 'Ainda nao ha instituicoes',
      institutionName: 'Nome da instituicao',
      use: 'Usar',
      addNewInstitution: 'Adicionar nova instituicao',
      grade: 'Serie',
      section: 'Turma',
      gradeExample: 'Ex: 11',
      sectionExample: 'Ex: A',
      spanish: 'Espanhol',
      english: 'Ingles',
      portuguese: 'Portugues',
    },
  }[language]

  const themeText: Record<string, { es: { name: string; description: string }; en: { name: string; description: string }; pt: { name: string; description: string } }> = {
    m3e: {
      es: { name: 'Material 3', description: 'Paleta verde ClearGrade, color personalizable' },
      en: { name: 'Material 3', description: 'ClearGrade green palette, customizable color' },
      pt: { name: 'Material 3', description: 'Paleta verde ClearGrade, cor personalizavel' },
    },
    forest: {
      es: { name: 'Forest & Moss', description: 'Verdes organicos para una agenda fisica moderna' },
      en: { name: 'Forest & Moss', description: 'Organic greens for a modern physical planner' },
      pt: { name: 'Forest & Moss', description: 'Verdes organicos para uma agenda fisica moderna' },
    },
    midnight: {
      es: { name: 'Midnight Corporate', description: 'Azul profundo y profesional' },
      en: { name: 'Midnight Corporate', description: 'Deep and professional blue' },
      pt: { name: 'Midnight Corporate', description: 'Azul profundo e profissional' },
    },
    cyber: {
      es: { name: 'Nothing Concept', description: 'Negro puro, acentos rojos y tipografia blanca' },
      en: { name: 'Nothing Concept', description: 'Pure black, red accents, and white typography' },
      pt: { name: 'Nothing Concept', description: 'Preto puro, acentos vermelhos e tipografia branca' },
    },
    sunset: {
      es: { name: 'Sunset Soft', description: 'Calido y energetico - reduce fatiga visual' },
      en: { name: 'Sunset Soft', description: 'Warm and energetic - reduces visual fatigue' },
      pt: { name: 'Sunset Soft', description: 'Quente e energetico - reduz fadiga visual' },
    },
    mono: {
      es: { name: 'Mono-Architectural', description: 'Minimalismo puro en escala de grises' },
      en: { name: 'Mono-Architectural', description: 'Pure minimalism in grayscale' },
      pt: { name: 'Mono-Architectural', description: 'Minimalismo puro em escala de cinza' },
    },
    ocean: {
      es: { name: 'Ocean', description: 'Azules oceanicos y profundos' },
      en: { name: 'Ocean', description: 'Deep ocean blues' },
      pt: { name: 'Ocean', description: 'Azuis oceanicos e profundos' },
    },
    rose: {
      es: { name: 'Rose', description: 'Tonos rosados y calidos' },
      en: { name: 'Rose', description: 'Warm pink tones' },
      pt: { name: 'Rose', description: 'Tons rosados e quentes' },
    },
    slate: {
      es: { name: 'Slate', description: 'Gris neutro y profesional' },
      en: { name: 'Slate', description: 'Neutral and professional gray' },
      pt: { name: 'Slate', description: 'Cinza neutro e profissional' },
    },
    amber: {
      es: { name: 'Amber', description: 'Dorado calido y energetico' },
      en: { name: 'Amber', description: 'Warm and energetic golden tone' },
      pt: { name: 'Amber', description: 'Dourado quente e energetico' },
    },
  }

  const getThemeText = (id: string, fallbackName: string, fallbackDescription: string) => {
    const text = themeText[id]
    if (!text) return { name: fallbackName, description: fallbackDescription }
    return text[language]
  }

  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'appearance' | 'security'>('appearance')
  const [pickerColor, setPickerColor] = useState('#516435')
  const supabase = createClient()

  // Security section state
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loadingInstitutions, setLoadingInstitutions] = useState(true)
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [newInstitutionName, setNewInstitutionName] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [creatingNew, setCreatingNew] = useState(false)
  const [grade, setGrade] = useState('')
  const [section, setSection] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const isMaterialTheme = theme?.id === 'm3e'

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('cleargrade-custom-color')
    if (saved) setPickerColor(saved)

    // Load user profile and institutions
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Load institutions
      setLoadingInstitutions(true)
      const { data: instData } = await supabase
        .from('institutions')
        .select('id, name')
        .order('name')
      if (instData) setInstitutions(instData)
      setLoadingInstitutions(false)

      // Load profile
      setLoadingProfile(true)
      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id, grade, section')
        .eq('id', user.id)
        .single()

      if (profile) {
        setGrade(profile.grade || '')
        setSection(profile.section || '')
        
        if (profile.institution_id && instData) {
          const inst = instData.find(i => i.id === profile.institution_id)
          if (inst) setSelectedInstitution(inst)
        }
      }
      setLoadingProfile(false)
    }
    loadData()
  }, [supabase])

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSaveProfile = async () => {
    if (!userId) return
    setSavingProfile(true)

    let institutionId = selectedInstitution?.id

    // Create new institution if needed
    if (!institutionId && newInstitutionName.trim()) {
      const { data: existing } = await supabase
        .from('institutions')
        .select('id')
        .ilike('name', newInstitutionName.trim())
        .single()

      if (existing) {
        institutionId = existing.id
      } else {
        const { data: newInst } = await supabase
          .from('institutions')
          .insert({
            name: newInstitutionName.trim(),
            created_by: userId
          })
          .select('id')
          .single()
        
        if (newInst) {
          institutionId = newInst.id
          // Refresh institutions list
          const { data: instData } = await supabase
            .from('institutions')
            .select('id, name')
            .order('name')
          if (instData) setInstitutions(instData)
        }
      }
    }

    await supabase
      .from('profiles')
      .update({
        institution_id: institutionId || null,
        grade: grade || null,
        section: section || null,
      })
      .eq('id', userId)

    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  if (!mounted) return null

  const handleThemeChange = (themeId: string) => {
    if (setTheme) setTheme(themeId)
  }

  const handleDarkModeChange = (mode: 'light' | 'dark' | 'auto') => {
    if (setDarkMode) setDarkMode(mode)
  }

  const handleColorChange = (color: string) => {
    setPickerColor(color)
    if (isMaterialTheme && applyCustomColor) {
      applyCustomColor(color)
    }
  }

  return (
    <main className="min-h-screen bg-background relative transition-colors duration-300">
      <div className="absolute top-4 right-4 z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted h-11 w-11">
            <X className="w-5 h-5 text-muted-foreground" />
          </Button>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 sm:pt-8">
        <div className="mb-8 space-y-1">
          <h1 className="text-4xl font-medium tracking-tight text-foreground">{ui.title}</h1>
          <p className="text-base text-muted-foreground">{ui.subtitle}</p>
        </div>

        <div
          className="mb-8 flex flex-wrap gap-1 rounded-full bg-muted/70 p-1.5 ring-1 ring-border/60 shadow-sm backdrop-blur-sm"
          role="tablist"
          aria-label={ui.sectionsAria}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'appearance'}
            onClick={() => setActiveTab('appearance')}
            className={cn(
              'inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200',
              activeTab === 'appearance'
                ? 'bg-secondary text-foreground shadow-sm ring-1 ring-border/50'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Palette className="w-4 h-4 shrink-0" />
            {ui.appearance}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            className={cn(
              'inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200',
              activeTab === 'security'
                ? 'bg-secondary text-foreground shadow-sm ring-1 ring-border/50'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Lock className="w-4 h-4 shrink-0" />
            {ui.security}
          </button>
        </div>

        {activeTab === 'appearance' && (
          <div className="space-y-10">
            <section className="space-y-4">
              <h2 className="text-xl font-medium text-foreground">{ui.colorMode}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['light', 'dark', 'auto'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleDarkModeChange(mode)}
                    className={cn(
                      'p-5 rounded-[1.75rem] border text-left shadow-sm transition-all duration-200',
                      darkMode === mode
                        ? 'border-outline-variant bg-muted/70 ring-1 ring-primary/18'
                        : 'border-border/80 bg-card hover:border-primary/25 hover:shadow-md'
                    )}
                  >
                    <div className="flex items-start justify-between text-foreground capitalize">
                      {mode === 'light' ? 'Claro' : mode === 'dark' ? 'Oscuro' : 'Auto'}
                      {darkMode === mode && <Check className="w-4 h-4 text-primary/85" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-medium text-foreground">{ui.presetThemes}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((themeOption) => {
                  const localized = getThemeText(themeOption.id, themeOption.name, themeOption.description)
                  return (
                  <button
                    key={themeOption.id}
                    type="button"
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={cn(
                      'p-5 rounded-[1.75rem] border text-left shadow-sm transition-all duration-200',
                      theme?.id === themeOption.id
                        ? 'border-outline-variant bg-muted/70 ring-1 ring-primary/18'
                        : 'border-border/80 bg-card hover:border-primary/25 hover:shadow-md'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{localized.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{localized.description}</p>
                      </div>
                      {theme?.id === themeOption.id && <Check className="w-4 h-4 text-primary/85" />}
                    </div>
                    <div className="flex gap-2">
                      {Object.values(themeOption.preview || {}).slice(0, 3).map((color, i) => (
                        <div key={i} className="w-6 h-6 rounded-full shadow-sm" style={{ background: color as string }} />
                      ))}
                    </div>
                  </button>
                )})}
              </div>
            </section>

            <section className={cn("space-y-6 pt-8 border-t border-border", !isMaterialTheme && "opacity-40 grayscale pointer-events-none")}>
              <h2 className="text-xl font-medium text-foreground">{ui.materialCustomization}</h2>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative w-24 h-24 rounded-3xl border-4 border-border shadow-xl overflow-hidden" style={{ backgroundColor: pickerColor }}>
                  <input
                    type="color"
                    value={pickerColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase">{ui.quickPresets}</p>
                  <div className="flex flex-wrap gap-2">
                    {['#516435', '#7C4DFF', '#FF5252', '#40C4FF', '#FFD740'].map((c) => (
                      <button
                        key={c}
                        onClick={() => handleColorChange(c)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                          activeCustomColor === c ? "border-outline-variant ring-1 ring-primary/18" : "border-transparent"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-10">
            {/* Institution Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-medium text-foreground">{ui.schoolInfo}</h2>
              <p className="text-sm text-muted-foreground">
                {ui.institutionHelp}
              </p>

              {loadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Institution Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {ui.institution}
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-full h-12 rounded-xl bg-card border border-border px-3 flex items-center justify-between text-left hover:border-primary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <School className="w-5 h-5 text-muted-foreground" />
                          <span className={selectedInstitution || newInstitutionName ? 'text-foreground' : 'text-muted-foreground'}>
                            {selectedInstitution?.name || newInstitutionName || ui.selectOrCreateInstitution}
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
                                placeholder={ui.searchInstitution}
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
                                {ui.loading}
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
                                  {selectedInstitution?.id === inst.id && (
                                    <Check className="w-4 h-4 text-primary ml-auto" />
                                  )}
                                </button>
                              ))
                            ) : searchQuery ? (
                              <div className="px-4 py-3 text-muted-foreground text-sm text-center">
                                {ui.noInstitutionsFound}
                              </div>
                            ) : (
                              <div className="px-4 py-3 text-muted-foreground text-sm text-center">
                                {ui.noInstitutionsYet}
                              </div>
                            )}
                          </div>

                          {/* Create new */}
                          <div className="border-t border-border p-2">
                            {creatingNew ? (
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder={ui.institutionName}
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
                                  {ui.use}
                                </Button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCreatingNew(true)}
                                className="w-full px-4 py-2.5 text-left hover:bg-secondary/50 transition-colors flex items-center gap-3 text-primary rounded-lg"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="font-medium">{ui.addNewInstitution}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grade and Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="grade" className="text-sm font-medium text-foreground">
                        {ui.grade}
                      </label>
                      <Input
                        id="grade"
                        type="text"
                        placeholder={ui.gradeExample}
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="h-12 rounded-xl bg-card border-border focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="section" className="text-sm font-medium text-foreground">
                        {ui.section}
                      </label>
                      <Input
                        id="section"
                        type="text"
                        placeholder={ui.sectionExample}
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="h-12 rounded-xl bg-card border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    {savingProfile ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : profileSaved ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        {t('guardado')}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {t('guardarCambios')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </section>

            {/* Language Section */}
            <section className="space-y-4 border-t border-border pt-6">
              <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('idioma')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('seleccionaIdioma')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['es', 'en', 'pt'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      'p-5 rounded-[1.75rem] border text-left shadow-sm transition-all duration-200',
                      language === lang
                        ? 'border-border bg-muted/70 ring-1 ring-primary/20'
                        : 'border-border/80 bg-card hover:border-primary/25 hover:shadow-md'
                    )}
                  >
                    <div className="flex items-start justify-between text-foreground">
                      <span className="font-medium">
                        {lang === 'es' ? ui.spanish : lang === 'en' ? ui.english : ui.portuguese}
                      </span>
                      {language === lang && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
