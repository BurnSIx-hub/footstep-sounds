# 👣 Footstep Sounds

**EN:** Footstep sounds for Foundry VTT (v12–v14) driven by scene Regions. Draw a Region, add the «Footstep Sounds: Surface Type» behavior, pick a surface — and any token moving through it produces matching footsteps. Walking (keyboard, cell by cell) and running (mouse drag over several cells) play at different tempo.

**Install:** Foundry VTT → Add-on Modules → Install Module →
```
https://github.com/BurnSIx-hub/footstep-sounds/releases/latest/download/module.json
```

---

## Что это (RU)

Звуки шагов через Регионы сцены: токен идёт по области — звучат шаги нужной поверхности. Ходьба (клавиатура, по клетке) и бег (перетаскивание мышью на несколько клеток) различаются темпом шагов.

### Поверхности в комплекте

- 🔩 Металл
- 🪨 Камень
- 🪵 Дерево
- 🦶 Гравий
- 🚪 Скрипучее дерево

### Как пользоваться

1. На сцене нарисуйте **Region** (инструмент регионов на левой панели)
2. В настройках региона добавьте поведение **«Footstep Sounds: Surface Type»**
3. Выберите тип поверхности
4. Готово: шаги слышат все, кто на сцене, — звук идёт через окружение Foundry (ползунок «Окружение»)

### Свои звуки

Положите файлы в `sounds/<поверхность>/` и поправьте список `SOUND_FILES` в начале `footstep-sounds.js`.

### Установка вручную

Скачайте `module.zip` из [последнего релиза](https://github.com/BurnSIx-hub/footstep-sounds/releases/latest) и распакуйте в `FoundryVTT/Data/modules/footstep-sounds/`.

---

## Звуки / Sound credits

Все звуки — **CC0 (public domain)**:
- [Different steps on wood, stone, leaves, gravel and mud](https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud) (OpenGameArt)
- [Fantozzi's Footsteps](https://opengameart.org/content/fantozzis-footsteps-grasssand-stone) (OpenGameArt)
- [100 CC0 metal and wood SFX](https://opengameart.org/content/100-cc0-metal-and-wood-sfx) (OpenGameArt)
- [100 CC0 SFX #2](https://opengameart.org/content/100-cc0-sfx-2) (OpenGameArt)

Другие модули автора: [BurnSIx-hub/foundry-modules](https://github.com/BurnSIx-hub/foundry-modules)

## Лицензия

MIT License — используйте свободно.
