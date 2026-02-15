'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PontosPage() {
  const [pointsAccounts, setPointsAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/points')
      const data = await res.json()
      setPointsAccounts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (value) => {
    return (value || 0).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  const programs = [...new Set(pointsAccounts.map(p => p.program))]
  const accounts = ['Miri', 'Vini', 'Lindy', 'Milla', 'Tony']

  const getProgramData = (programName) => {
    const programData = pointsAccounts.find(p => p.program === programName)
    return programData?.accounts || []
  }

  const getAccountTotal = (account) => {
    return pointsAccounts.reduce((total, program) => {
      const programAccount = program.accounts?.find(a => a.account === account)
      if (programAccount) {
        return total + (programAccount.currentBalance || 0) + (programAccount.pointsToReceive || 0)
      }
      return total
    }, 0)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Pontos e Milhas</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {accounts.map(account => {
          const total = getAccountTotal(account)
          return (
            <Card key={account}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {account}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatNumber(total)}</p>
                <p className="text-xs text-gray-500 mt-1">pontos/milhas</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">
              Nenhum programa de pontos cadastrado
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={programs[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            {programs.map((program, index) => (
              <TabsTrigger key={`${program}-${index}`} value={program}>
                {program}
              </TabsTrigger>
            ))}
          </TabsList>

          {programs.map((program, programIndex) => {
            const programAccounts = getProgramData(program)
            return (
              <TabsContent key={`${program}-content-${programIndex}`} value={program} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{program}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {programAccounts.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Nenhuma conta cadastrada para este programa
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {programAccounts.map((acc, accIndex) => (
                          <Card key={`${program}-${acc.account}-${accIndex}`} className="border-2">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">
                                {acc.account}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div>
                                <p className="text-xs text-gray-600">Saldo Atual</p>
                                <p className="text-xl font-bold text-blue-600">
                                  {formatNumber(acc.currentBalance)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">A Receber</p>
                                <p className="text-lg font-semibold text-orange-600">
                                  {formatNumber(acc.pointsToReceive)}
                                </p>
                              </div>
                              <div className="pt-2 border-t">
                                <p className="text-xs text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-green-600">
                                  {formatNumber((acc.currentBalance || 0) + (acc.pointsToReceive || 0))}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </div>
  )
}
