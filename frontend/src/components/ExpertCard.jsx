import React from 'react'

const ExpertCard = ({ quote, name, role, initial, delay }) => {
  return (
    <div className="es-card" style={{ animationDelay: `${delay}s` }}>
            <p className="es-card-quote">{quote}</p>
            <div className="es-card-footer">
                <div className="es-card-avatar">{initial}</div>
                <div>
                    <div className="es-card-name">{name}</div>
                    <div className="es-card-role">{role}</div>
                </div>
            </div>
        </div>
  )
}

export default ExpertCard
