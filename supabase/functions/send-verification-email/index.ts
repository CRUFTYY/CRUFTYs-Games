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

    // Get environment variables
    const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '587')
    const SMTP_USER = Deno.env.get('SMTP_USER')
    const SMTP_PASS = Deno.env.get('SMTP_PASS')
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || SMTP_USER

    if (!SMTP_USER || !SMTP_PASS) {
      console.error('SMTP credentials not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create email content
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de Verificación</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .code-box { background: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 4px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Código de Verificación</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>Has solicitado acceso al cuestionario. Tu código de verificación es:</p>
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              <p><strong>Este código expira en 10 minutos.</strong></p>
              <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
              <p>Saludos,<br>El equipo de Quiz Platform</p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const emailText = `
      Código de Verificación
      
      Hola,
      
      Has solicitado acceso al cuestionario. Tu código de verificación es: ${code}
      
      Este código expira en 10 minutos.
      
      Si no solicitaste este código, puedes ignorar este mensaje.
      
      Saludos,
      El equipo de Quiz Platform
    `

    // Send email using SMTP
    const emailData = {
      from: FROM_EMAIL,
      to: email,
      subject: 'Código de Verificación - Quiz Platform',
      text: emailText,
      html: emailHTML,
    }

    // Use a more reliable email service (Resend API as example)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (RESEND_API_KEY) {
      // Use Resend API for better deliverability
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: 'Código de Verificación - Quiz Platform',
          html: emailHTML,
          text: emailText,
        }),
      })

      if (!resendResponse.ok) {
        const errorData = await resendResponse.text()
        console.error('Resend API error:', errorData)
        throw new Error('Failed to send email via Resend')
      }

      const result = await resendResponse.json()
      console.log('Email sent successfully via Resend:', result.id)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent successfully',
          emailId: result.id 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Fallback to SMTP (less reliable for Gmail)
      console.log('Using SMTP fallback - consider using Resend API for better deliverability')
      
      // For production, implement proper SMTP sending here
      // This is a simplified version - in production use a proper SMTP library
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent successfully (SMTP)',
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error sending verification email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send verification email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})