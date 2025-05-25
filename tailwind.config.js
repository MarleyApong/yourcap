/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,tas,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Couleurs de base
        background: {
          DEFAULT: "#ffffff", // Fond principal de l'application
          2: "#ffffff", // Variante secondaire (pour dégradés ou contrastes)
        },
        foreground: "#000000", // Couleur principale du texte

        // Cartes et popovers
        card: {
          DEFAULT: "#ffffff", // Fond des composants de type "carte"
          foreground: "#000000", // Texte sur les cartes
        },
        popover: {
          DEFAULT: "#ffffff", // Fond des popups/tooltips
          foreground: "#000000", // Texte dans les popups
        },

        // Couleurs principales
        primary: {
          DEFAULT: "#0e4b76", // Couleur principale/boutons primaires
          foreground: "#ffffff", // Texte sur fond primary
        },
        secondary: {
          DEFAULT: "#f1f1f1", // Couleur secondaire/boutons secondaires
          foreground: "#0e4b76", // Texte sur fond secondary
        },

        // Éléments discrets
        muted: {
          DEFAULT: "#46484d", // Pour textes/éléments moins importants
          foreground: "#737373", // Variante texte
        },
        accent: {
          DEFAULT: "#d1d9e6", // Pour éléments mis en avant (hover, etc.)
          foreground: "#0e4b76", // Texte sur fond accent
        },

        // États dangereux/erreurs
        destructive: {
          DEFAULT: "#d42b2b", // Pour erreurs/actions dangereuses
          2: "#e77d7d", // Variante plus claire
          foreground: "#ffffff", // Texte sur fond d'erreur
        },

        // Bordures et inputs
        border: "#e4e4e4", // Couleur des bordures
        input: "#d3d3d3", // Fond des champs de formulaire

        // Spécifiques
        close: "#9c1313", // Couleur pour boutons de fermeture
        ring: "#0e4b76", // Couleur du focus ring (accessibilité)

        // Palettes pour graphiques
        chart: {
          1: "#e23b3b", // Rouge
          2: "#0e4b76", // Vert principal
          3: "#365b78", // Bleu
          4: "#e5bb23", // Jaune
          5: "#0e4b76", // Vert (dupliqué)
          6: "#19b159", // Vert clair
        },

        // Header
        header: {
          background: "#ffffff", // Fond du header
          foreground: "#0e4b76", // Texte du header
          primary: "#e5e5e5", // Éléments principaux du header
          primaryForeground: "#0e4b76", // Texte sur ces éléments
          accent: "#d1d9e6", // Accents dans le header
          accentForeground: "#0e4b76", // Texte sur ces accents
          border: "#cccccc", // Bordures du header
          ring: "#e4e4e4", // Focus ring dans le header
        },

        // Sidebar
        sidebar: {
          background: "#ffffff", // Fond de la sidebar
          foreground: "#000000", // Texte dans la sidebar
          primary: "#e5e5e5", // Éléments principaux
          primaryForeground: "#0e4b76", // Texte sur ces éléments
          accent: "#d1d9e6", // Accents
          accentForeground: "#0e4b76", // Texte sur accents
          border: "#ffffff", // Bordures
          ring: "#e4e4e4", // Focus ring
        },

        // Autres
        scrollbar: "#a4bbab", // Couleur de la scrollbar
        "hover-row": "#f0f5f2", // Couleur au survol des lignes
        "hover-row-highlight": "#0e4b765f", // Variante highlight

        // Badges
        badge: {
          bg: {
            // Backgrounds
            1: "#bdfbd2", // Vert très clair
            2: "#b1d0ec", // Bleu clair
            3: "#f4cdac", // Orange clair
            4: "#fbb6f2", // Rose
            5: "#eca2b6", // Rose foncé
          },
          fg: {
            // Foregrounds (texte)
            1: "#07481f", // Vert foncé
            2: "#0f5c93", // Bleu foncé
            3: "#9b591f", // Orange foncé
            4: "#8e0e7d", // Violet
            5: "#bf0638", // Rouge
          },
        },

        // Mode sombre - Mêmes catégories mais avec des couleurs adaptées
        dark: {
          background: {
            DEFAULT: "#1a1c1a",
            2: "#242824",
          },
          foreground: "#f8f9f8",
          card: {
            DEFAULT: "#2a2e2a",
            foreground: "#f8f9f8",
          },
          popover: {
            DEFAULT: "#242824",
            foreground: "#f8f9f8",
          },
          primary: {
            DEFAULT: "#0e4b76",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#334433",
            foreground: "#a6c2b0",
          },
          muted: {
            DEFAULT: "#4a524a",
            foreground: "#beccbe",
          },
          accent: {
            DEFAULT: "#384838",
            foreground: "#c8d8c8",
          },
          destructive: {
            DEFAULT: "#b91c1c",
            foreground: "#fef2f2",
          },
          border: "#404840",
          input: "#2d332d",
          ring: "#0e4b76",
          chart: {
            1: "#3ea04c",
            2: "#4c90d9",
            3: "#d97a4c",
            4: "#9c4cd9",
            5: "#d94c7a",
            6: "#4cd9c3",
          },
          header: {
            background: "#1a1c1a",
            foreground: "#0e4b76",
            primary: "#334433",
            primaryForeground: "#a6c2b0",
            accent: "#384838",
            accentForeground: "#c8d8c8",
            border: "#404840",
            ring: "#0e4b76",
          },
          sidebar: {
            background: "#1a1c1a",
            foreground: "#f8f9f8",
            primary: "#e5e5e5f4",
            primaryForeground: "#ffffff",
            accent: "#384838",
            accentForeground: "#c8d8c8",
            border: "#404840",
            ring: "#0e4b76",
          },
          scrollbar: "#404840",
          "hover-row": "#232623",
          "hover-row-highlight": "#0e4b765f",
        },
      },
      borderRadius: {
        DEFAULT: "0.4rem", // Rayon de bordure par défaut
      },
    },
  },
  plugins: [],
  darkMode: "class", // Activation du mode sombre via classe
}
