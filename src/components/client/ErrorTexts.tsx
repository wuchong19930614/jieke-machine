'use client'
// 错误页文案（界面文案 › 错误页）：根布局读到后放进上下文，错误页从这里取；取不到时（例如根布局本身出错）用默认英文
import React, { createContext, useContext } from 'react'

import { defaultsOf, type TextsOf } from '@/content/defineTexts'
import { UI_ERROR } from '@/content/texts'

type ErrorTexts = TextsOf<typeof UI_ERROR>

const ErrorTextsContext = createContext<ErrorTexts | null>(null)

export function ErrorTextsProvider({ texts, children }: { texts: ErrorTexts; children: React.ReactNode }) {
  return <ErrorTextsContext.Provider value={texts}>{children}</ErrorTextsContext.Provider>
}

export const useErrorTexts = (): ErrorTexts => useContext(ErrorTextsContext) ?? defaultsOf(UI_ERROR)
