import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface EmailRequest {
  email: string;
  code: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code }: EmailRequest = await req.json()

    // Validate input
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate Gmail address
    if (!email.endsWith('@gmail.com')) {
      return new Response(
        JSON.stringify({ error: 'Only Gmail addresses are supported' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For development/demo purposes, simulate successful email sending
    // In production, you would configure actual email service credentials
    console.log(`Simulated email sent to ${email} with code: ${code}`)
    
    // Create email content for logging
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de Verificación</title>
        </head>
        <body>
          <h1>Código de Verificación</h1>
          <p>Tu código de verificación es: <strong>${code}</strong></p>
          <p>Este código expira en 10 minutos.</p>
        </body>
      </html>
    `

    console.log('Email content:', emailHTML)
    
    // Return success response for development
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully (development mode)',
        developmentMode: true,
        code: code // Include code in response for development
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-verification-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process verification email request',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})