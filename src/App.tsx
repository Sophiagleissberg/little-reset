import { useState } from 'react'
import { TimerSheet } from './components/habits/TimerSheet'
import { AddButton } from './components/layout/AddButton'
import { AppShell } from './components/layout/AppShell'
import { TabBar } from './components/layout/TabBar'
import type { Tab } from './components/layout/TabBar'
import { ExpenseSheet } from './components/spending/ExpenseSheet'
import { StoreProvider, useStore } from './hooks/useStore'
import { HabitsScreen } from './screens/HabitsScreen'
import { SpendingScreen } from './screens/SpendingScreen'
import { TodayScreen } from './screens/TodayScreen'
import type { Habit } from './types'

function Screens() {
  const { state, addExpense, completeHabit } = useStore()
  const [tab, setTab] = useState<Tab>('today')
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null)
  const [addingExpense, setAddingExpense] = useState(false)

  return (
    <>
      <AppShell>
        {tab === 'today' ? (
          <TodayScreen
            onStartTimer={setTimerHabit}
            onOpenHabits={() => setTab('habits')}
            onOpenSpending={() => setTab('spending')}
          />
        ) : null}
        {tab === 'habits' ? <HabitsScreen /> : null}
        {tab === 'spending' ? <SpendingScreen /> : null}
      </AppShell>

      {tab !== 'habits' ? (
        <AddButton label="Record spending" onClick={() => setAddingExpense(true)} />
      ) : null}

      <TabBar active={tab} onChange={setTab} />

      <ExpenseSheet
        open={addingExpense}
        expenses={state.expenses}
        onClose={() => setAddingExpense(false)}
        onSave={addExpense}
      />

      <TimerSheet
        habit={timerHabit}
        onClose={() => setTimerHabit(null)}
        onFinish={completeHabit}
      />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Screens />
    </StoreProvider>
  )
}
