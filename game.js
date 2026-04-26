(function () {
  'use strict';

  const e = React.createElement;
  const { useState, useEffect, useCallback, useRef } = React;

  const SIZE = 4;
  const BEST_KEY = 'game2048Best';

  function emptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function clone(g) { return g.map(r => r.slice()); }

  function emptyCells(g) {
    const cells = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (g[r][c] === 0) cells.push([r, c]);
    return cells;
  }

  function addRandom(g) {
    const cells = emptyCells(g);
    if (cells.length === 0) return null;
    const [r, c] = cells[Math.floor(Math.random() * cells.length)];
    const ng = clone(g);
    ng[r][c] = Math.random() < 0.9 ? 2 : 4;
    return { grid: ng, added: [r, c] };
  }

  function rotate(g) {
    const ng = emptyGrid();
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        ng[c][SIZE - 1 - r] = g[r][c];
    return ng;
  }

  function slideLeft(g) {
    let scoreGain = 0;
    const merged = [];
    const ng = g.map((row, r) => {
      const filtered = row.filter(v => v !== 0);
      const out = [];
      for (let i = 0; i < filtered.length; i++) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          const sum = filtered[i] * 2;
          out.push(sum);
          scoreGain += sum;
          merged.push([r, out.length - 1]);
          i++;
        } else {
          out.push(filtered[i]);
        }
      }
      while (out.length < SIZE) out.push(0);
      return out;
    });
    return { grid: ng, scoreGain, merged };
  }

  function move(grid, dir) {
    let g = clone(grid);
    let mergedAbs = [];
    let scoreGain = 0;

    if (dir === 'left') {
      const r = slideLeft(g);
      g = r.grid; scoreGain = r.scoreGain; mergedAbs = r.merged;
    } else if (dir === 'right') {
      g = g.map(row => row.slice().reverse());
      const r = slideLeft(g);
      g = r.grid.map(row => row.slice().reverse());
      scoreGain = r.scoreGain;
      mergedAbs = r.merged.map(([row, col]) => [row, SIZE - 1 - col]);
    } else if (dir === 'up') {
      g = rotate(rotate(rotate(g)));
      const r = slideLeft(g);
      g = rotate(r.grid);
      scoreGain = r.scoreGain;
      mergedAbs = r.merged.map(([row, col]) => [col, row]);
    } else if (dir === 'down') {
      g = rotate(g);
      const r = slideLeft(g);
      g = rotate(rotate(rotate(r.grid)));
      scoreGain = r.scoreGain;
      mergedAbs = r.merged.map(([row, col]) => [SIZE - 1 - col, row]);
    }

    return { grid: g, scoreGain, merged: mergedAbs };
  }

  function gridsEqual(a, b) {
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (a[r][c] !== b[r][c]) return false;
    return true;
  }

  function canMove(g) {
    if (emptyCells(g).length > 0) return true;
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        if (r + 1 < SIZE && g[r][c] === g[r + 1][c]) return true;
        if (c + 1 < SIZE && g[r][c] === g[r][c + 1]) return true;
      }
    return false;
  }

  function hasReached2048(g) {
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (g[r][c] >= 2048) return true;
    return false;
  }

  function startingGrid() {
    let g = emptyGrid();
    g = addRandom(g).grid;
    g = addRandom(g).grid;
    return g;
  }

  function tileClass(v) {
    if (v === 0) return '';
    if (v <= 2048) return 'tile-' + v;
    return 'tile-super';
  }

  function App() {
    const [grid, setGrid] = useState(() => startingGrid());
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(() => {
      try { return parseInt(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
    });
    const [over, setOver] = useState(false);
    const [won, setWon] = useState(false);
    const [keepPlaying, setKeepPlaying] = useState(false);
    const [newCell, setNewCell] = useState(null);
    const [mergedCells, setMergedCells] = useState([]);

    const lastInputRef = useRef(0);

    const reset = () => {
      setGrid(startingGrid());
      setScore(0);
      setOver(false);
      setWon(false);
      setKeepPlaying(false);
      setNewCell(null);
      setMergedCells([]);
    };

    const doMove = useCallback((dir) => {
      if (over || (won && !keepPlaying)) return;
      const now = Date.now();
      if (now - lastInputRef.current < 90) return;
      lastInputRef.current = now;

      const result = move(grid, dir);
      if (gridsEqual(result.grid, grid)) return;

      let next = result.grid;
      const added = addRandom(next);
      if (added) next = added.grid;

      setGrid(next);
      setScore(s => {
        const ns = s + result.scoreGain;
        if (ns > best) {
          setBest(ns);
          try { localStorage.setItem(BEST_KEY, String(ns)); } catch {}
        }
        return ns;
      });
      setNewCell(added ? added.added : null);
      setMergedCells(result.merged);

      if (hasReached2048(next) && !won) setWon(true);
      if (!canMove(next)) setOver(true);
    }, [grid, over, won, keepPlaying, best]);

    useEffect(() => {
      const handler = (ev) => {
        const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
        const dir = map[ev.key];
        if (dir) {
          ev.preventDefault();
          doMove(dir);
        }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [doMove]);

    useEffect(() => {
      const board = document.querySelector('.board');
      if (!board) return;
      let sx = 0, sy = 0, active = false;
      const onStart = (ev) => {
        const t = ev.touches ? ev.touches[0] : ev;
        sx = t.clientX; sy = t.clientY; active = true;
      };
      const onEnd = (ev) => {
        if (!active) return;
        active = false;
        const t = ev.changedTouches ? ev.changedTouches[0] : ev;
        const dx = t.clientX - sx, dy = t.clientY - sy;
        if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
        if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left');
        else doMove(dy > 0 ? 'down' : 'up');
      };
      board.addEventListener('touchstart', onStart, { passive: true });
      board.addEventListener('touchend', onEnd, { passive: true });
      board.addEventListener('mousedown', onStart);
      board.addEventListener('mouseup', onEnd);
      return () => {
        board.removeEventListener('touchstart', onStart);
        board.removeEventListener('touchend', onEnd);
        board.removeEventListener('mousedown', onStart);
        board.removeEventListener('mouseup', onEnd);
      };
    }, [doMove]);

    const cells = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        cells.push(e('div', { className: 'cell', key: `bg-${r}-${c}` }));

    const tiles = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = grid[r][c];
        if (v === 0) {
          tiles.push(e('div', { key: `t-${r}-${c}`, style: { visibility: 'hidden' } }));
        } else {
          const isNew = newCell && newCell[0] === r && newCell[1] === c;
          const isMerged = mergedCells.some(([mr, mc]) => mr === r && mc === c);
          const cls = ['tile', tileClass(v)];
          if (isNew) cls.push('tile-new');
          if (isMerged) cls.push('tile-merged');
          tiles.push(e('div', { key: `t-${r}-${c}`, className: cls.join(' ') }, v));
        }
      }
    }

    return e('div', { className: 'app' }, [
      e('div', { className: 'app-header', key: 'h' }, [
        e('button', { className: 'back-btn', onClick: () => window.location.href = 'homescreen.html', key: 'back' }, '‹ Home'),
        e('h1', { className: 'app-title', key: 'title' }, '2048'),
      ]),

      e('div', { className: 'scores', key: 'scores' }, [
        e('div', { className: 'score-card', key: 's1' }, [
          e('div', { className: 'score-label', key: 'l' }, 'Score'),
          e('div', { className: 'score-value', key: 'v' }, score),
        ]),
        e('div', { className: 'score-card', key: 's2' }, [
          e('div', { className: 'score-label', key: 'l' }, 'Best'),
          e('div', { className: 'score-value', key: 'v' }, best),
        ]),
      ]),

      e('div', { className: 'controls', key: 'ctrl' }, [
        e('div', { className: 'subtitle', key: 'sub' }, 'Join the tiles, get to 2048!'),
        e('button', { className: 'btn-primary', onClick: reset, key: 'new' }, 'New Game'),
      ]),

      e('div', { className: 'board', key: 'board' }, [
        e('div', { className: 'grid-bg', key: 'bg' }, cells),
        e('div', { className: 'tiles', key: 'tl' }, tiles),
        over ? e('div', { className: 'overlay', key: 'over' }, [
          e('h2', { key: 'h' }, 'Game over'),
          e('button', { className: 'btn-primary', onClick: reset, key: 'b' }, 'Try Again'),
        ]) : null,
        won && !keepPlaying ? e('div', { className: 'overlay win', key: 'win' }, [
          e('h2', { key: 'h' }, 'You win!'),
          e('div', { style: { display: 'flex', gap: 10 }, key: 'btns' }, [
            e('button', { className: 'btn-primary', onClick: () => setKeepPlaying(true), key: 'kp' }, 'Keep Going'),
            e('button', { className: 'btn-primary', onClick: reset, key: 'tr' }, 'New Game'),
          ]),
        ]) : null,
      ]),

      e('div', { className: 'instructions', key: 'inst' },
        'Swipe or use arrow keys to move tiles. Tiles with the same number merge when they touch.'
      ),

      e('div', { className: 'dpad', key: 'dpad' }, [
        e('div', { className: 'spacer', key: 's1' }),
        e('button', { onClick: () => doMove('up'), key: 'up' }, '↑'),
        e('div', { className: 'spacer', key: 's2' }),
        e('button', { onClick: () => doMove('left'), key: 'left' }, '←'),
        e('button', { onClick: () => doMove('down'), key: 'down' }, '↓'),
        e('button', { onClick: () => doMove('right'), key: 'right' }, '→'),
      ]),
    ]);
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(e(App));
})();
