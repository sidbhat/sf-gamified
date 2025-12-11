#!/bin/bash

# Spanish (es-ES)
cat > es-ES.json << 'EOF'
{
  "ui": {
    "buttons": {
      "start": "Iniciar misión",
      "cancel": "Cancelar",
      "close": "Cerrar",
      "next": "Siguiente misión",
      "allQuests": "Todas las misiones",
      "downloadBadge": "Insignia",
      "shareLinkedIn": "Compartir en LinkedIn",
      "reset": "Reiniciar",
      "confirm": "Confirmar",
      "ok": "OK",
      "retry": "Recargar",
      "send": "Enviar"
    },
    "headers": {
      "questSelection": "Joule Quest",
      "readyToStart": "¿Listo?",
      "questComplete": "¡Misión completada!",
      "questCompleteWithErrors": "Misión completada (con errores)",
      "success": "¡Éxito!",
      "oops": "¡Ups!",
      "stepFailed": "Paso fallido",
      "stepSkipped": "Paso omitido",
      "yourTurn": "¡Tu turno!",
      "resetProgress": "¿Reiniciar?",
      "questLocked": "Misión bloqueada"
    },
    "labels": {
      "points": "PUNTOS",
      "quests": "MISIONES",
      "step": "Paso {current}/{total}",
      "difficulty": "Dificultad",
      "estimatedTime": "Tiempo estimado",
      "waitingForYou": "Esperando...",
      "openingQuestSelection": "Abriendo...",
      "hint": "Consejo",
      "rewards": "Recompensas",
      "congrats": "¡Maestro Joule!",
      "congratsPartial": "¡Continúa!",
      "progress": "Progreso"
    },
    "messages": {
      "resetConfirm": "Esto eliminará todo. ¿Continuar?",
      "questLockedInfo": "🔒 Completar {count} misión{s}",
      "continueNextStep": "⏭️ Siguiente paso...",
      "questWillContinue": "💡 Opcional...",
      "questComplete": "🎉 ¡Completado! 🏆",
      "questCompleteGoal": "🎉 ¡Completado! 🏆"
    },
    "tabs": {
      "employee": "Empleado",
      "manager": "Gerente",
      "agent": "Agente",
      "sales": "Ventas",
      "procurement": "Compras",
      "delivery": "Entrega"
    },
    "icons": {
      "employee": "👤",
      "manager": "👔",
      "agent": "⚡",
      "sales": "📊",
      "procurement": "📦",
      "delivery": "🚚"
    }
  },
  "journeys": {
    "employee": { "name": "Primera semana", "description": "Primera semana en la empresa" },
    "manager": { "name": "Nuevo gerente", "description": "Primeras semanas como gerente" },
    "agent": { "name": "Revolución IA", "description": "Transformar el trabajo con IA" },
    "s4hana-sales": { "name": "Héroe de ventas", "description": "Dominar operaciones de ventas" },
    "s4hana-procurement": { "name": "Campeón de compras", "description": "Gestión de compras" },
    "s4hana-delivery": { "name": "Mago de almacén", "description": "Dominar logística" }
  },
  "errors": {
    "contentScriptNotLoaded": { "icon": "🔄", "title": "Configuración necesaria", "message": "Conectando...", "causes": ["Extensión instalada", "Página abierta", "Cargando"], "solutions": ["⏱️ Esperar", "⌘ Actualizar", "🔌 Verificar"], "actionText": "Actualizar" },
    "jouleNotFound": { "icon": "🔍", "title": "Joule no disponible", "message": "Joule no encontrado", "causes": ["No activado", "Página incorrecta", "Cargando"], "solutions": ["🏠 Página de inicio", "⏳ Esperar", "💬 Contactar admin"] },
    "jouleIframeNotFound": { "icon": "⚠️", "title": "Joule no responde", "message": "Sin respuesta", "causes": ["Cerrado", "Interrumpido"], "solutions": ["🔄 Reintentar", "🏠 Actualizar"] },
    "stepTimeout": { "icon": "⏱️", "title": "Tiempo agotado", "message": "Demasiado tiempo", "causes": ["Complejo", "Lento", "Elemento faltante"], "solutions": ["⏭️ Continuar", "🔄 Reintentar"] },
    "elementNotFound": { "icon": "🔍", "title": "Elemento no encontrado", "message": "Elemento faltante", "causes": ["Cambiado", "Cargando", "Página incorrecta"], "solutions": ["⏭️ Continuar", "🏠 Verificar"] },
    "promptSendFailed": { "icon": "📤", "title": "Envío fallido", "message": "Mensaje no enviado", "causes": ["No listo", "Interrumpido", "Ocupado"], "solutions": ["⏭️ Continuar", "🔄 Reintentar"] },
    "buttonNotFound": { "icon": "🔘", "title": "Botón no encontrado", "message": "Botón faltante", "causes": ["Cambiado", "Cargando", "Formato"], "solutions": ["⏭️ Continuar", "👀 Consola"] },
    "inputFieldNotFound": { "icon": "📝", "title": "Campo no encontrado", "message": "Campo faltante", "causes": ["Formato", "Cargando", "Config"], "solutions": ["⏭️ Continuar", "🔄 Reintentar"] },
    "unknownError": { "icon": "❌", "title": "Error", "message": "Error inesperado", "causes": ["Red", "Conflicto", "Compatibilidad"], "solutions": ["🔄 Actualizar", "💬 Reportar"] },
    "whyThisHappened": "Por qué:",
    "whatToDo": "Qué hacer:",
    "technicalDetails": "Detalles"
  },
  "popup": {
    "title": "Joule Quest",
    "loading": "Cargando..."
  }
}
EOF

# Portuguese (pt-BR)
cat > pt-BR.json << 'EOF'
{
  "ui": {
    "buttons": {
      "start": "Iniciar missão",
      "cancel": "Cancelar",
      "close": "Fechar",
      "next": "Próxima missão",
      "allQuests": "Todas as missões",
      "downloadBadge": "Emblema",
      "shareLinkedIn": "Compartilhar no LinkedIn",
      "reset": "Reiniciar",
      "confirm": "Confirmar",
      "ok": "OK",
      "retry": "Recarregar",
      "send": "Enviar"
    },
    "headers": {
      "questSelection": "Joule Quest",
      "readyToStart": "Pronto?",
      "questComplete": "Missão concluída!",
      "questCompleteWithErrors": "Missão concluída (com erros)",
      "success": "Sucesso!",
      "oops": "Ops!",
      "stepFailed": "Etapa falhou",
      "stepSkipped": "Etapa pulada",
      "yourTurn": "Sua vez!",
      "resetProgress": "Reiniciar?",
      "questLocked": "Missão bloqueada"
    },
    "labels": {
      "points": "PONTOS",
      "quests": "MISSÕES",
      "step": "Etapa {current}/{total}",
      "difficulty": "Dificuldade",
      "estimatedTime": "Tempo estimado",
      "waitingForYou": "Aguardando...",
      "openingQuestSelection": "Abrindo...",
      "hint": "Dica",
      "rewards": "Recompensas",
      "congrats": "Mestre Joule!",
      "congratsPartial": "Continue!",
      "progress": "Progresso"
    },
    "messages": {
      "resetConfirm": "Isso apagará tudo. Continuar?",
      "questLockedInfo": "🔒 Concluir {count} missão{s}",
      "continueNextStep": "⏭️ Próxima etapa...",
      "questWillContinue": "💡 Opcional...",
      "questComplete": "🎉 Concluído! 🏆",
      "questCompleteGoal": "🎉 Concluído! 🏆"
    },
    "tabs": {
      "employee": "Funcionário",
      "manager": "Gerente",
      "agent": "Agente",
      "sales": "Vendas",
      "procurement": "Compras",
      "delivery": "Entrega"
    },
    "icons": {
      "employee": "👤",
      "manager": "👔",
      "agent": "⚡",
      "sales": "📊",
      "procurement": "📦",
      "delivery": "🚚"
    }
  },
  "journeys": {
    "employee": { "name": "Primeira semana", "description": "Primeira semana na empresa" },
    "manager": { "name": "Novo gerente", "description": "Primeiras semanas como gerente" },
    "agent": { "name": "Revolução IA", "description": "Transformar o trabalho com IA" },
    "s4hana-sales": { "name": "Herói de vendas", "description": "Dominar operações de vendas" },
    "s4hana-procurement": { "name": "Campeão de compras", "description": "Gestão de compras" },
    "s4hana-delivery": { "name": "Mago do armazém", "description": "Dominar logística" }
  },
  "errors": {
    "contentScriptNotLoaded": { "icon": "🔄", "title": "Configuração necessária", "message": "Conectando...", "causes": ["Extensão instalada", "Página aberta", "Carregando"], "solutions": ["⏱️ Aguardar", "⌘ Atualizar", "🔌 Verificar"], "actionText": "Atualizar" },
    "jouleNotFound": { "icon": "🔍", "title": "Joule indisponível", "message": "Joule não encontrado", "causes": ["Não ativado", "Página errada", "Carregando"], "solutions": ["🏠 Página inicial", "⏳ Aguardar", "💬 Contatar admin"] },
    "jouleIframeNotFound": { "icon": "⚠️", "title": "Joule não responde", "message": "Sem resposta", "causes": ["Fechado", "Interrompido"], "solutions": ["🔄 Tentar novamente", "🏠 Atualizar"] },
    "stepTimeout": { "icon": "⏱️", "title": "Tempo esgotado", "message": "Muito tempo", "causes": ["Complexo", "Lento", "Elemento ausente"], "solutions": ["⏭️ Continuar", "🔄 Tentar novamente"] },
    "elementNotFound": { "icon": "🔍", "title": "Elemento não encontrado", "message": "Elemento ausente", "causes": ["Mudou", "Carregando", "Página errada"], "solutions": ["⏭️ Continuar", "🏠 Verificar"] },
    "promptSendFailed": { "icon": "📤", "title": "Envio falhou", "message": "Mensagem não enviada", "causes": ["Não pronto", "Interrompido", "Ocupado"], "solutions": ["⏭️ Continuar", "🔄 Tentar novamente"] },
    "buttonNotFound": { "icon": "🔘", "title": "Botão não encontrado", "message": "Botão ausente", "causes": ["Mudou", "Carregando", "Formato"], "solutions": ["⏭️ Continuar", "👀 Console"] },
    "inputFieldNotFound": { "icon": "📝", "title": "Campo não encontrado", "message": "Campo ausente", "causes": ["Formato", "Carregando", "Config"], "solutions": ["⏭️ Continuar", "🔄 Tentar novamente"] },
    "unknownError": { "icon": "❌", "title": "Erro", "message": "Erro inesperado", "causes": ["Rede", "Conflito", "Compatibilidade"], "solutions": ["🔄 Atualizar", "💬 Reportar"] },
    "whyThisHappened": "Por quê:",
    "whatToDo": "O que fazer:",
    "technicalDetails": "Detalhes"
  },
  "popup": {
    "title": "Joule Quest",
    "loading": "Carregando..."
  }
}
EOF

echo "Created es-ES.json and pt-BR.json"
