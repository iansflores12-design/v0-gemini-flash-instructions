'use client'

import { useState } from 'react'

export function FooterEasterEgg() {
  const [clickCount, setClickCount] = useState(0)
  const [showPopup, setShowPopup] = useState(false)

  const handleClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    
    if (newCount >= 7) {
      setShowPopup(true)
      setClickCount(0)
    }
  }

  return (
    <>
      <div 
        className="flex items-center justify-center gap-3 text-lg font-bold text-muted-foreground tracking-wide"
        style={{ fontFamily: "'Kollektif', 'Google Sans', sans-serif" }}
      >
        <img
          src="/tree-os-light.svg"
          alt="tree os"
          className="w-8 h-8 dark:hidden cursor-pointer select-none"
          onClick={handleClick}
        />
        <img
          src="/tree-os-dark.svg"
          alt="tree os"
          className="w-8 h-8 hidden dark:block cursor-pointer select-none"
          onClick={handleClick}
        />
        <span>by tree os</span>
      </div>

      {/* Easter Egg Popup */}
      {showPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowPopup(false)}
        >
          <div 
            className="max-w-lg w-full bg-card border border-border rounded-3xl p-6 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">🙏</span>
              </div>
              
              <p className="text-lg font-medium text-foreground leading-relaxed">
                Nada de esto hubiera sido posible sin Jehova, mi pastor. Todo lo que hago se lo dedico a El.
              </p>

              <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                <p className="text-sm font-semibold text-primary mb-2">Salmo 27</p>
                <p className="text-sm text-muted-foreground leading-relaxed text-left">
                  Jehova es mi luz y mi salvacion; ¿de quien temere? Jehova es la fortaleza de mi vida; ¿de quien he de atemorizarme?
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed text-left mt-2">
                  Cuando se juntaron contra mi los malignos, mis angustiadores y mis enemigos, para comer mis carnes, ellos tropezaron y cayeron.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed text-left mt-2">
                  Aunque un ejercito acampe contra mi, no temera mi corazon; aunque contra mi se levante guerra, yo estare confiado.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed text-left mt-2">
                  Una cosa he demandado a Jehova, esta buscare; que este yo en la casa de Jehova todos los dias de mi vida, para contemplar la hermosura de Jehova, y para inquirir en su templo.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed text-left mt-2">
                  Porque el me escondera en su tabernaculo en el dia del mal; me ocultara en lo reservado de su morada; sobre una roca me pondra en alto.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed text-left mt-2">
                  Hubiera yo desmayado, si no creyese que vere la bondad de Jehova en la tierra de los vivientes.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed text-left mt-2 font-medium">
                  Aguarda a Jehova; esfuerzate, y aliéntese tu corazon; si, espera a Jehova.
                </p>
              </div>

              <p className="text-lg font-semibold text-foreground">Amen.</p>

              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
