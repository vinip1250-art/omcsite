'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function ProgramasPage() {
  const [programs, setPrograms] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    store: '',
    type: 'POINTS',
    active: true
  })

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/programs/all')
      const data = await res.json()
      setPrograms(data)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingProgram 
        ? `/api/programs/${editingProgram.id}`
        : '/api/programs'

      const method = editingProgram ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingProgram ? 'Programa atualizado!' : 'Programa cadastrado!')
        setShowForm(false)
        setEditingProgram(null)
        setFormData({ name: '', store: '', type: 'POINTS', active: true })
        fetchPrograms()
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar programa')
    }
  }

  const handleEdit = (program) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      store: program.store || '',
      type: program.type || 'POINTS',
      active: program.active
    })
    setShowForm(true)
  }

  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      })

      if (response.ok) {
        fetchPrograms()
      }
    } catch (error) {
      alert('Erro ao atualizar status')
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Programas e Lojas</h1>
        <Button onClick={() => {
          setShowForm(!showForm)
          setEditingProgram(null)
          setFormData({ name: '', store: '', type: 'POINTS', active: true })
        }}>
          {showForm ? 'Cancelar' : '+ Novo Programa'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProgram ? 'Editar' : 'Novo'} Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Programa *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Esfera, Livelo, Smiles..."
                    required
                  />
                </div>
                <div>
                  <Label>Loja/Clube *</Label>
                  <Input
                    value={formData.store}
                    onChange={(e) => setFormData({...formData, store: e.target.value})}
                    placeholder="Ex: Fast Shop, Casas Bahia, PagBank..."
                    required
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="POINTS">Pontos</option>
                    <option value="MILES">Milhas</option>
                    <option value="CASHBACK">Cashback</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingProgram ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Programas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead>Loja/Clube</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhum programa cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                programs.map(program => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">
                      {program.store}/{program.name}
                    </TableCell>
                    <TableCell>{program.name}</TableCell>
                    <TableCell>{program.store}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {program.type === 'POINTS' ? 'Pontos' : program.type === 'MILES' ? 'Milhas' : 'Cashback'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={program.active ? 'default' : 'secondary'}>
                        {program.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEdit(program)}>
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant={program.active ? 'destructive' : 'default'}
                          onClick={() => handleToggleActive(program.id, program.active)}
                        >
                          {program.active ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
