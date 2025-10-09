export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Glows roxos e brancos */}
      <div className="absolute inset-0">
        {/* Glow roxo superior esquerdo */}
        <div 
          className="absolute top-[10%] left-[15%] w-[600px] h-[600px] rounded-full opacity-60 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(125, 68, 255, 0.6) 0%, rgba(125, 68, 255, 0.3) 30%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '8s',
          }}
        />
        
        {/* Glow roxo direito */}
        <div 
          className="absolute top-[20%] right-[10%] w-[700px] h-[700px] rounded-full opacity-50 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(125, 68, 255, 0.5) 0%, rgba(125, 68, 255, 0.25) 40%, transparent 70%)',
            filter: 'blur(90px)',
            animationDuration: '10s',
            animationDelay: '2s',
          }}
        />

        {/* Glow branco centro */}
        <div 
          className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 60%)',
            filter: 'blur(85px)',
            animationDuration: '7s',
            animationDelay: '1s',
          }}
        />

        {/* Glow roxo inferior esquerdo */}
        <div 
          className="absolute bottom-[15%] left-[20%] w-[650px] h-[650px] rounded-full opacity-55 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(157, 111, 255, 0.6) 0%, rgba(125, 68, 255, 0.3) 35%, transparent 65%)',
            filter: 'blur(95px)',
            animationDuration: '9s',
            animationDelay: '3s',
          }}
        />

        {/* Glow branco inferior direito */}
        <div 
          className="absolute bottom-[10%] right-[25%] w-[550px] h-[550px] rounded-full opacity-25 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.12) 35%, transparent 60%)',
            filter: 'blur(80px)',
            animationDuration: '11s',
            animationDelay: '4s',
          }}
        />

        {/* Glow roxo claro centro-direito */}
        <div 
          className="absolute top-[60%] right-[35%] w-[600px] h-[600px] rounded-full opacity-45 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.5) 0%, rgba(125, 68, 255, 0.2) 40%, transparent 70%)',
            filter: 'blur(100px)',
            animationDuration: '12s',
            animationDelay: '5s',
          }}
        />
      </div>

      {/* Camada de overlay escura REDUZIDA para ofuscar menos */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[60px]"
        style={{
          backdropFilter: 'blur(60px)',
          WebkitBackdropFilter: 'blur(60px)',
        }}
      />

      {/* Gradiente adicional MAIS SUAVE para profundidade */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 70%, rgba(0, 0, 0, 0.6) 100%)',
        }}
      />

      {/* Ruído sutil para textura (opcional) */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
