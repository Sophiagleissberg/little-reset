import { useCallback, useState } from 'react'
import { TimerSheet } from './components/habits/TimerSheet'
import { AddButton } from './components/layout/AddButton'
import { AppShell } from './components/layout/AppShell'
import { TabBar } from './components/layout/TabBar'
import type { Tab } from './components/layout/TabBar'
import { ExpenseSheet } from './components/spending/ExpenseSheet'
import { Toast } from './components/ui/Toast'
import { StoreProvider, useStore } from './hooks/useStore'
import { HabitsScreen } from './screens/HabitsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SpendingScreen } from './screens/SpendingScreen'
import { TodayScreen } from './screens/TodayScreen'
import type { Habit } from './types'

function Screens() {
  const { state, addExpense, completeHabit } = useStore()
  const [tab, setTab] = useState<Tab>('today')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null)
  const [addingExpense, setAddingExpense] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const clearToast = useCallback(() => setToast(null), [])

  const openSettings = () => {
    setSettingsOpen(true)
    setAddingExpense(false)
  }

  const afterReset = () => {
    setSettingsOpen(false)
    setTab('today')
    setTimerHabit(null)
    setAddingExpense(false)
  }

  return (
    <>
      <AppShell>
        {settingsOpen ? (
          <SettingsScreen
            onBack={() => setSettingsOpen(false)}
            onAfterReset={afterReset}
            onToast={setToast}
          />
        ) : (
          <>
            {tab === 'today' ? (
              <TodayScreen
                onStartTimer={setTimerHabit}
                onOpenHabits={() => setTab('habits')}
                onOpenSpending={() => setTab('spending')}
                onOpenSettings={openSettings}
              />
            ) : null}
            {tab === 'habits' ? <HabitsScreen /> : null}
            {tab === 'spending' ? <SpendingScreen /> : null}
          </>
        )}
      </AppShell>

      {!settingsOpen && tab !== 'habits' ? (
        <AddButton label="Record spending" onClick={() => setAddingExpense(true)} />
      ) : null}

      {!settingsOpen ? <TabBar active={tab} onChange={setTab} /> : null}

      <ExpenseSheet
        open={addingExpense}
        expenses={state.transactions}
        onClose={() => setAddingExpense(false)}
        onSave={addExpense}
      />

      <TimerSheet
        habit={timerHabit}
        onClose={() => setTimerHabit(null)}
        onFinish={completeHabit}
      />

      <Toast message={toast} onDone={clearToast} />
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
