import { describe, it, expect } from 'vitest';
import { chunkText } from '../src/ingest-pdf';
import { cosineSimilarity } from '../src/server';

describe('Chunking de Texto', () => {
  it('deve dividir texto em chunks do tamanho especificado', () => {
    const text = 'a'.repeat(1000);
    const chunks = chunkText(text, 200, 50);
    
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].length).toBeLessThanOrEqual(200);
  });

  it('deve criar chunks com overlap', () => {
    const text = 'Olá mundo teste de chunking com overlap para verificar funcionamento';
    const chunks = chunkText(text, 30, 10);
    
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('deve ignorar chunks muito pequenos', () => {
    const text = 'Texto curto.';
    const chunks = chunkText(text, 100, 20);
    
    // Texto menor que tamanho mínimo (50 chars) deve ser ignorado
    expect(chunks.length).toBe(0);
  });

  it('deve normalizar espaços múltiplos', () => {
    const text = 'Texto    com    múltiplos     espaços';
    const chunks = chunkText(text, 100, 20);
    
    if (chunks.length > 0) {
      expect(chunks[0]).not.toContain('  '); // Não deve ter espaços duplos
    }
  });

  it('deve lidar com texto vazio', () => {
    const text = '';
    const chunks = chunkText(text, 100, 20);
    
    expect(chunks.length).toBe(0);
  });

  it('deve lidar com texto exatamente do tamanho do chunk', () => {
    const text = 'a'.repeat(100);
    const chunks = chunkText(text, 100, 20);
    
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Similaridade de Cosseno', () => {
  it('deve retornar 1 para vetores idênticos', () => {
    const vec = [1, 2, 3, 4, 5];
    const similarity = cosineSimilarity(vec, vec);
    
    expect(similarity).toBeCloseTo(1, 5);
  });

  it('deve retornar 0 para vetores ortogonais', () => {
    const vecA = [1, 0, 0];
    const vecB = [0, 1, 0];
    const similarity = cosineSimilarity(vecA, vecB);
    
    expect(similarity).toBe(0);
  });

  it('deve retornar -1 para vetores opostos', () => {
    const vecA = [1, 2, 3];
    const vecB = [-1, -2, -3];
    const similarity = cosineSimilarity(vecA, vecB);
    
    expect(similarity).toBeCloseTo(-1, 5);
  });

  it('deve calcular similaridade corretamente para vetores genéricos', () => {
    const vecA = [1, 2, 3];
    const vecB = [4, 5, 6];
    const similarity = cosineSimilarity(vecA, vecB);
    
    // Cálculo manual: (1*4 + 2*5 + 3*6) / (sqrt(14) * sqrt(77))
    // = 32 / (sqrt(1078)) ≈ 0.9746
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThan(1);
    expect(similarity).toBeCloseTo(0.9746, 2);
  });

  it('deve retornar 0 para vetor zero', () => {
    const vecA = [0, 0, 0];
    const vecB = [1, 2, 3];
    const similarity = cosineSimilarity(vecA, vecB);
    
    expect(similarity).toBe(0);
  });

  it('deve lançar erro para vetores de tamanhos diferentes', () => {
    const vecA = [1, 2, 3];
    const vecB = [1, 2];
    
    expect(() => cosineSimilarity(vecA, vecB)).toThrow('Vetores devem ter o mesmo tamanho');
  });

  it('deve funcionar com vetores grandes (embeddings reais)', () => {
    // Simula embeddings de 1536 dimensões (Titan)
    const vecA = Array.from({ length: 1536 }, () => Math.random());
    const vecB = Array.from({ length: 1536 }, () => Math.random());
    
    const similarity = cosineSimilarity(vecA, vecB);
    
    expect(similarity).toBeGreaterThanOrEqual(-1);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it('deve ser simétrico (A·B = B·A)', () => {
    const vecA = [1, 2, 3, 4];
    const vecB = [5, 6, 7, 8];
    
    const simAB = cosineSimilarity(vecA, vecB);
    const simBA = cosineSimilarity(vecB, vecA);
    
    expect(simAB).toBeCloseTo(simBA, 10);
  });
});
