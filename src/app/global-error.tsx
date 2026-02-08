"use client";

/**
 * Global Error Handler
 * 
 * This file handles uncaught errors at the root level.
 * It must be a Client Component and cannot use any context providers
 * since it renders outside of the normal component tree.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-global-errors
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '500px'
        }}>
          <h1 style={{
            fontSize: '2rem',
            marginBottom: '1rem',
            fontWeight: 600
          }}>
            Something went wrong!
          </h1>
          <p style={{
            color: '#a0a0a0',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && (
            <p style={{
              fontSize: '0.75rem',
              color: '#666',
              marginBottom: '1.5rem',
              fontFamily: 'monospace'
            }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#ffffff',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
