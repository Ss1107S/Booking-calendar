const LOCALE = 'hr-HR';
const FORMAT_LOCALE = 'fr-FR';

const DATE_MENU_PRESETS = [
  { label: 'Od prije 5 godina', offset: { years: -5 }, condition: 'gt' },
  { label: 'Od prije 3 godine', offset: { years: -3 }, condition: 'gt' },
  { label: 'Od prije 2 mjeseca', offset: { months: -2 }, condition: 'gt' }
];

const DateUtil = {
  offsetDate({ years = 0, months = 0 }) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + years);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);  // returns yyyy-mm-dd
  },

  toLocaleFR(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString('fr-FR');
  },
  fromAny(txt) {
    txt = txt.trim();
    // -- ISO yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) return txt;
    // -- fr-FR dd/mm/yyyy or d/m/yyyy
    const m = txt.match(/^(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})$/);
    if (m) {
      const [ , d, mo, y] = m;
      return `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
    // -- Date.parse fallback
    const dObj = new Date(txt);
    return isNaN(dObj) ? null : dObj.toISOString().slice(0,10);
  }
};
function isoLocal(d) {
  return [
    d.getFullYear(),
    (d.getMonth() + 1).toString().padStart(2, '0'),
    d.getDate().toString().padStart(2, '0')
  ].join('-');
}

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - y0) / 864e5 + 1) / 7);
}
const months12 = [...Array(12).keys()]
  .map(i => new Date(2000, i, 1).toLocaleString(LOCALE, { month: 'long' }));

  const range = n => [...Array(n).keys()];
function _toDate(v){
  if (v instanceof Date && !isNaN(v)) return v;
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)){
    const d = new Date(v + 'T00:00:00Z');
    if (!isNaN(d)) return d;
  }
  return null; // invalid
}

class DatePicker {
  constructor({ container, value = new Date(), onSelect, autoClose = true, baseDate = null }) {
    this.onSelect = onSelect;
    this.current = new Date(value.getFullYear(), value.getMonth(), 1);
    this.selected = value;
    this.baseDate = baseDate instanceof Date && !isNaN(baseDate)
     ? baseDate : null;
    this.autoClose = autoClose;

    container.classList.add('datepicker-root', 'w-70',
      'border-gray-300', 'bg-white', 'absolute');
    container.innerHTML = this.#html(); // header+body skeleton
    this.el = container;

    /* cache refs */
    this.monthSel = this.el.querySelector('.dp-month');
    this.yearSel  = this.el.querySelector('.dp-year');
    this.weeksEl  = this.el.querySelector('.dp-weeks');
    this.daysEl   = this.el.querySelector('.dp-days');
    this.todayEl  = this.el.querySelector('.dp-today');

    /* populate selects */
    months12.forEach((m, i) => this.monthSel.add(new Option(m, i)));
    range(11).forEach(i => {
      const y = this.current.getFullYear() - 5 + i;
      this.yearSel.add(new Option(String(y), y));
    });

    /* listeners */
    this.el.querySelector('.dp-prev').onclick = () => this.#nav(-1);
    this.el.querySelector('.dp-next').onclick = () => this.#nav(+1);
    this.monthSel.onchange = () => { this.current.setMonth(+this.monthSel.value); this.#draw(); };
    this.yearSel .onchange = () => { this.current.setFullYear(+this.yearSel.value); this.#draw(); };

    // this.todayEl.textContent = new Date().toLocaleDateString(FORMAT_LOCALE);
    this.todayEl.textContent =
      this.baseDate
        ? this.baseDate.toLocaleDateString(FORMAT_LOCALE)
        : new Date().toLocaleDateString(FORMAT_LOCALE);
    this.#draw();
  }

  destroy() { this.el.remove(); }

  /* ---------- private ---------- */
  #html() {
    return /*html*/`
      <div class="flex items-center justify-between px-1 py-1 border-b bg-blue-700">
        <button class="dp-prev px-2 text-sm cursor-pointer"><i class="fas text-white fa-angle-left"></i></button>
        <div class="grow flex justify-center">
          <select class="dp-month bg-white mx-1 text-center outline-none"></select>
          <select class="dp-year bg-white mx-1 w-20 text-center outline-none"></select>
        </div>
        <button class="dp-next px-2 text-sm cursor-pointer"><i class="fas text-white fa-angle-right"></i></button>
      </div>
      <div class="flex">
        <div class="flex flex-col bg-gray-200">
          <div class="py-0.5 text-center font-medium">#</div>
          <div class="dp-weeks flex-1 flex flex-col gap-[1.5px] mt-[1px]"></div>
        </div>
        <div class="flex-1 flex flex-col">
          <div class="grid grid-cols-7 py-0.5 text-center font-medium border-b">
            <span>Po</span><span>Ut</span><span>Sr</span><span>Če</span>
            <span>Pe</span><span class="text-blue-600">Su</span>
            <span class="text-blue-600">Ne</span>
          </div>
          <div class="dp-days flex-1 flex flex-col gap-[1.5px] select-none"></div>
        </div>
      </div>
      <div class="dp-today border-t px-2 py-1.25 text-left"></div>`;
  }

  #nav(m) { this.current.setMonth(this.current.getMonth() + m); this.#draw(); }



  selectDay(cell) {
    if (this.selectedCell) this.selectedCell.classList.toggle('selected', 0);
    this.selectedCell = cell;
    cell.classList.toggle('selected', 1);
  }

  setValue(v) {
    const d = _toDate(v);
    if (!d) return false; // reject invalid values

    // --- update - state ---
    this.selected = d;
    this.current  = new Date(d.getFullYear(), d.getMonth(), 1);

    this.monthSel.value = this.current.getMonth();
    this.yearSel.value  = this.current.getFullYear();

    this.#draw();
    return true;

  }
  setBaseDate(d) {
    this.baseDate = (d instanceof Date && !isNaN(d)) ? d : null;
    this.todayEl.textContent = this.baseDate
      ? this.baseDate.toLocaleDateString(FORMAT_LOCALE)
      : new Date().toLocaleDateString(FORMAT_LOCALE);
    this.#draw();
  }


  #draw() {
    this.monthSel.value = this.current.getMonth();
    this.yearSel.value  = this.current.getFullYear();

    const first = new Date(this.current.getFullYear(), this.current.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // grid starts from Monday

    this.weeksEl.innerHTML = this.daysEl.innerHTML = '';

    for (let w = 0; w < 6; w++) {
      const wkNo = isoWeek(start);
      const wkDiv = document.createElement('div');
      wkDiv.textContent = wkNo;
      wkDiv.className = 'h-6 px-1.25 flex items-center justify-center';
      this.weeksEl.appendChild(wkDiv);

      const row = document.createElement('div');
      row.className = 'grid grid-cols-7 flex-1 cursor-pointer px-[1.5px] gap-[1.5px]';

      range(7).forEach(() => {
        const cell = document.createElement('div');
        const cellDate = new Date(start); // clone current cell date
        cell.textContent = cellDate.getDate();
        cell.dataset.date = isoLocal(cellDate);

        const isOtherMonth = cellDate.getMonth() !== this.current.getMonth();
        const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;

        cell.className = 'h-6 flex items-center justify-center ' +
          (isOtherMonth ? 'text-gray-400 ' : isWeekend ? 'text-blue-600 ' : 'text-black ');

        /* highlight selected date */
        if (this.selected && cellDate.toDateString() === this.selected.toDateString()) {
          this.selectedCell = cell;
          cell.classList.add('selected');
        }

        // outline base date 
        if (this.baseDate && cellDate.toDateString() === this.baseDate.toDateString()) {
          cell.classList.add('is-base');
        }

        cell.onclick = () => {
          console.log("change")
          this.selectDay(cell);
          this.selected = new Date(cell.dataset.date);
          this.onSelect?.(this.selected);
          if (this.autoClose) this.destroy();
        };

        row.appendChild(cell);
        start.setDate(start.getDate() + 1); // advance to next cell date

      });
      this.daysEl.appendChild(row);
    }
  }
}

