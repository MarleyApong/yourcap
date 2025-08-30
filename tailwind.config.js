/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Base colors
        background: {
          DEFAULT: "var(--background)",
          secondary: "var(--background-secondary)",
        },
        foreground: "var(--foreground)",

        // Cards and popovers
        card: {
          DEFAULT: "var(--card-background)",
          foreground: "var(--card-foreground)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover-background)",
          foreground: "var(--popover-foreground)",
        },

        // Primary colors
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          900: "var(--primary-900)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },

        // Navigation specific colors
        navigation: {
          background: "var(--navigation-background)",
          foreground: "var(--navigation-foreground)",
          active: {
            background: "var(--navigation-active-background)",
            foreground: "var(--navigation-active-foreground)",
          },
          inactive: {
            background: "var(--navigation-inactive-background)",
            foreground: "var(--navigation-inactive-foreground)",
          },
          border: "var(--navigation-border)",
          shadow: "var(--navigation-shadow)",
        },

        // Header colors
        header: {
          background: "var(--header-background)",
          foreground: "var(--header-foreground)",
          primary: "var(--header-primary)",
          primaryForeground: "var(--header-primary-foreground)",
          accent: "var(--header-accent)",
          accentForeground: "var(--header-accent-foreground)",
          border: "var(--header-border)",
        },

        // Sidebar colors
        sidebar: {
          background: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          primaryForeground: "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          accentForeground: "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
        },

        // Status colors
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },

        // Utility colors
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // Chart colors
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
          6: "var(--chart-6)",
        },

        // Badge colors
        badge: {
          bg: {
            1: "var(--badge-bg-1)",
            2: "var(--badge-bg-2)",
            3: "var(--badge-bg-3)",
            4: "var(--badge-bg-4)",
            5: "var(--badge-bg-5)",
          },
          fg: {
            1: "var(--badge-fg-1)",
            2: "var(--badge-fg-2)",
            3: "var(--badge-fg-3)",
            4: "var(--badge-fg-4)",
            5: "var(--badge-fg-5)",
          },
        },
      },
      borderRadius: {
        DEFAULT: "0.4rem",
      },
      boxShadow: {
        navigation: "var(--navigation-shadow-style)",
        header: "var(--header-shadow-style)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
}
