# Contrato de Perfil Compartilhado — v1

Referência reutilizável por **Inanna, Iza e Arara**. Coletar o perfil **uma vez só**
por pessoa e ler por todos os apps (`plano-coleta-unificada.md`). Implementado em
`supabase/migrations/009_shared_profile_contract.sql`.

> **Versão:** `perfil_versao = 1`. Mudou um campo do núcleo? Suba a versão e trate a
> migração — apps leem `perfil_versao` para saber se precisam recoletar.

---

## 1. As três camadas (não misturar)

| Camada | Onde vive | Reuso |
|---|---|---|
| **Identidade** | `participantes` (id, email, nome, município, origem, turma) + check-in | já compartilhada |
| **Perfil compartilhado** | colunas abaixo em `participantes` + view `perfil_compartilhado_v1` | **este contrato** |
| **Estado por app** | tabelas próprias de cada jogo (rima, peleja, trilha) | NÃO unificar |

A unificação se aplica **só à camada do meio**.

## 2. Campos do perfil compartilhado

| Campo | Valores | Sensibilidade | Obrigatório |
|---|---|---|---|
| `oficina_cordel20` | bool | baixa | núcleo |
| `usou_chatbot_ia` | bool | baixa | núcleo |
| `faixa_etaria` | `menos_de_11`,`12_14`,`15_17`,`18_29`,`30_44`,`45_59`,`maior_de_60` | média (define menor) | núcleo |
| `municipio` + `estado`/`pais` | texto / UF / `FORA_BRASIL` | baixa | núcleo |
| `genero` | `feminino`,`masculino`,`outro` (ou vazio = não informado) | **sensível** | **opcional** |
| `identificacao_racial` | `negro`,`branco`,`pardo`,`indigena`,`outro` (ou vazio) | **sensível** | **opcional** |

Metadados de controle (gravados pelo sistema, não perguntados):
`perfil_versao`, `coletado_via`, `perfil_completed_at` (coletado_em), `updated_at`
(atualizado_em), `consent_perfil_versao`, `consent_sensiveis_at`.

> **Raça/cor:** mantém o domínio atual do Inanna. O alinhamento às categorias IBGE
> (branca/preta/parda/amarela/indígena) fica para uma versão futura do contrato.

## 3. Regras LGPD embutidas no banco (não dependem do front)

- **Sensíveis opcionais:** `genero`/`identificacao_racial` vazios ou inválidos → gravados
  como `null`. Nunca bloqueiam. `perfil_completo` mede **só o núcleo**.
- **Gate de menor:** se `faixa_etaria ∈ {menos_de_11, 12_14, 15_17}`, a RPC **descarta**
  sensíveis (não coleta de menor sem mediação).
- **Consentimento sensível:** registrado em `perfil_consent_log` (append-only, RLS,
  só `service_role`) quando há dado sensível, com `consent_perfil_versao`.
- **Saída agregada:** relatórios usam sensíveis só em agregado, nunca por indivíduo.

## 4. Como um app lê/escreve (fluxo "uma vez só")

```
1. App resolve identidade (email → participante).
2. App lê o perfil + perfil_versao:
     select * from perfil_compartilhado_v1 where participante_id = :id;
   (ou RPC lookup_participante_por_email para o caminho de check-in)
3. Perfil completo e na versão atual → não pergunta nada.
4. Falta campo do núcleo → pergunta só o que falta e grava:
     rpc registrar_perfil_participante(..., p_coletado_via => 'iza'|'arara'|'inanna')
5. Próximo app lê e pula a pergunta.
```

### RPC de escrita — `registrar_perfil_participante`
Params: `p_participante_id, p_email, p_oficina_cordel20, p_usou_chatbot_ia, p_genero,
p_identificacao_racial, p_faixa_etaria, p_municipio, p_estado, p_pais='BR',
p_coletado_via='inanna', p_consent_perfil_versao=null`.
**Outros apps mudam só `p_coletado_via`.** Retorna o perfil já recalculado.

### Leitura canônica — view `perfil_compartilhado_v1`
Exposta a `service_role` (apps leem pelo próprio backend). Campos = seção 2 + metadados.

## 5. Forward-compatible (hub futuro)

Hoje cada app tem seu Supabase; o "lugar de verdade" do perfil é o check-in/Inanna.
Quando existir o Supabase de identidade compartilhado, **este mesmo schema, RPC e view
migram direto** — troca-se o hub de destino sem mudar a lógica dos apps nem reperguntar
nada a ninguém. Mantenha a assinatura da RPC e os nomes da view estáveis dentro de `v1`.
