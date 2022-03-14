/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Level, Logger } from 'Logger';

/**
 * Logger and Levels
 */
const mylogger = new Logger();
const error: Level = 0;
const warn: Level = 1;
const info: Level = 2;
const debug: Level = 3;

/**
 * The binary operations supported by the calculator.
 */
export enum Op {
  /**
   * Addition.
   */
  Add,

  /**
   * Subtraction.
   */
  Sub,

  /**
   * Multiplication.
   */
  Mul,

  /**
   * Division.
   */
  Div
}

/**
 * Log Visibility
 */
export enum LogVisibility {
  Display,
  Ignore
}

/**
 * A basic four-function calculator. UI logic is handled separately in
 * {@link CalculatorUI}.
 */
export class Calculator {
  /**
   * The contents of the calculator's LCD display.
   */
  lcd: string;

  /**
   * The result of the last operation if `repeat` is `false`, or the second
   * argument of the last operation if `repeat` is `true`.
   */
  arg: number;

  /**
   * The last operation that the user entered.
   */
  lastOp: Op;

  /**
   * If `true`, the calculator is in "overwrite mode"; if `false`, the
   * calculator is in "append mode". In overwrite mode, the next input replaces
   * the current screen contents; in append mode, the next input appends to the
   * current screen contents.
   */
  overwrite: boolean;

  /**
   * If `true`, the calculator is in "repeat mode". In repeat mode, when the =
   * button is pressed, the screen is updated by re-executing the previous
   * operation with the same right-hand argument as last time. For example, if
   * the previous operation was 3 + 5 and the calculator is in repeat mode,
   * pressing = will update the screen with the number 13.
   */
  repeat: boolean;

  /**
   * In its initial state, the calculator's screen shows `0`, there is no
   * previous result or operation, and overwrite mode is enabled.
   */
  constructor() {
    this.lcd = '0';
    this.arg = null;
    this.lastOp = null;
    this.overwrite = true;
    this.repeat = false;
  }

  /**
   * Input a single digit.
   * @param x a single digit, 0-9
   */
  digit(x: number): void {
    // Display debug message each time digit key is pressed
    mylogger.display('digit key is pressed', debug);

    if (this.overwrite) {
      this.lcd = x.toString();
      this.overwrite = false;
      // Display informational message each time the calculator switches from
      // overwrite mode to append mode
      mylogger.display('overwrite mode to append mode', info);
    } else {
      this.lcd += x;
    }

    // If the number on screen is larger than Number.MAX_SAFE_INTEGER
    // or smaller than Number.MIN_SAFE_INTEGER, display warn log
    if (parseFloat(this.lcd) > Number.MAX_SAFE_INTEGER)
      mylogger.display('number on screen is larger than Number.MAX_SAFE_INTEGER', warn);
    if (parseFloat(this.lcd) < Number.MIN_SAFE_INTEGER)
      mylogger.display('number on screen is smaller than Number.MIN_SAFE_INTEGER', warn);
  }

  /**
   * Input a decimal point.
   */
  decimal(): void {
    // Display debug message each time decimal key is pressed
    mylogger.display('decimal key is pressed', debug);

    if (this.overwrite) {
      this.lcd = '0.';
      this.overwrite = false;
      // Display informational message each time the calculator switches from
      // overwrite mode to append mode
      mylogger.display('overwrite mode to append mode', info);
    } else if (this.lcd.indexOf('.') === -1) { // don't allow more than one '.'
      this.lcd += '.';
    }

    // If the number on screen is larger than Number.MAX_SAFE_INTEGER
    // or smaller than Number.MIN_SAFE_INTEGER, display warn log
    if (parseFloat(this.lcd) > Number.MAX_SAFE_INTEGER)
      mylogger.display('number on screen is larger than Number.MAX_SAFE_INTEGER', warn);
    if (parseFloat(this.lcd) < Number.MIN_SAFE_INTEGER)
      mylogger.display('number on screen is smaller than Number.MIN_SAFE_INTEGER', warn);
  }

  /**
   * Negate the current value on the screen.
   */
  negate(): void {
    // Display debug message each time negate key is pressed
    mylogger.display('negate key is pressed', debug);

    if (this.overwrite) {
      this.lcd = '0';
      this.overwrite = false;
      // Display informational message each time the calculator switches from
      // overwrite mode to append mode
      mylogger.display('overwrite mode to append mode', info);
    } else if (this.lcd !== '0') { // don't negate '0'
      if (this.lcd.charAt(0) === '-')
        this.lcd = this.lcd.substring(1);
      else
        this.lcd = '-' + this.lcd;
    }

    // If the number on screen is larger than Number.MAX_SAFE_INTEGER
    // or smaller than Number.MIN_SAFE_INTEGER, display warn log
    if (parseFloat(this.lcd) > Number.MAX_SAFE_INTEGER)
      mylogger.display('number on screen is larger than Number.MAX_SAFE_INTEGER', warn);
    if (parseFloat(this.lcd) < Number.MIN_SAFE_INTEGER)
      mylogger.display('number on screen is smaller than Number.MIN_SAFE_INTEGER', warn);
  }

  /**
   * Input a binary operator. If there is a pending operation whose result has
   * not yet been displayed, update the screen to display that result. For
   * example, when a user inputs 2 + 4 + 8, the screen is updated to display 6
   * on the second + input.
   */
  op(o: Op): void {
    // Display debug message each time operation key is pressed
    mylogger.display('operation key is pressed', debug);

    // Display informational message each time the calculator switches from
    // overwrite mode to append mode
    if (!this.overwrite)
      mylogger.display('append mode to overwrite mode', info);

    this.overwrite = true;
    if (this.arg === null || this.repeat) { // if this is the first argument
      this.lastOp = o;
      this.arg = parseFloat(this.lcd);
    } else { // if this is the second argument
      switch (this.lastOp) {
        case Op.Add: this.lcd = (this.arg + parseFloat(this.lcd)).toString(); break;
        case Op.Sub: this.lcd = (this.arg - parseFloat(this.lcd)).toString(); break;
        case Op.Mul: this.lcd = (this.arg * parseFloat(this.lcd)).toString(); break;
        case Op.Div: this.lcd = (this.arg / parseFloat(this.lcd)).toString(); break;
      }
      this.lastOp = o;
      this.arg = parseFloat(this.lcd);
    }
    this.repeat = false;
  }

  /**
   * If the calculator is not in repeat mode, compute the result of the pending
   * expression if there is one. If the calculator is in repeat mode,
   * re-execute the previous operation.
   *
   * @see {@link repeat}
   */
  equals(): void {
    // Display debug message each time equals key is pressed
    mylogger.display('equals key is pressed', debug);

    // If `repeat` is disabled, this press of = will enable it. In that case,
    // the value currently on screen is the second argument, the one that's used
    // when repeating the operation.
    const oldLcd = parseFloat(this.lcd);

    // If `repeat` is disabled, then `this.arg` is the first argument to the
    // operation; if `repeat` is enabled, then it's the second argument.
    // This doesn't matter in the + and * cases because the result is the same
    // either way.
    switch (this.lastOp) {
      case Op.Add: this.lcd = (this.arg + parseFloat(this.lcd)).toString(); break;
      case Op.Sub:
        if (this.repeat)
          this.lcd = (parseFloat(this.lcd) - this.arg).toString();
        else
          this.lcd = (this.arg - parseFloat(this.lcd)).toString();
        break;
      case Op.Mul: this.lcd = (this.arg * parseFloat(this.lcd)).toString(); break;
      case Op.Div:
        if (this.repeat) {
          this.lcd = (parseFloat(this.lcd) / this.arg).toString();
        } else {
          // If dividing by 0, display error log
          if (parseFloat(this.lcd) === 0)
            mylogger.display('cannot divide by 0', error);
          this.lcd = (this.arg / parseFloat(this.lcd)).toString();
        }
        break;
    }

    // If the number on screen is larger than Number.MAX_SAFE_INTEGER
    // or smaller than Number.MIN_SAFE_INTEGER, display warn log
    if (parseFloat(this.lcd) > Number.MAX_SAFE_INTEGER)
      mylogger.display('number on screen is larger than Number.MAX_SAFE_INTEGER', warn);
    if (parseFloat(this.lcd) < Number.MIN_SAFE_INTEGER)
      mylogger.display('number on screen is smaller than Number.MIN_SAFE_INTEGER', warn);

    // If `repeat` is disabled, we need to save the previous value of the screen
    // to use it as the second argument when repeating the operation.
    if (!this.repeat)
      this.arg = oldLcd;

    // Display informational message each time the calculator switches from
    // overwrite mode to append mode
    if (!this.overwrite)
      mylogger.display('append mode to overwrite mode', info);

    this.repeat = true;
    this.overwrite = true;
  }

  /**
   * Clear the screen, resetting it to 0. If in overwrite mode, reset the
   * entire calculator to its initial state.
   */
  clear(): void {
    // Display debug message each time clear key is pressed
    mylogger.display('clear key is pressed', debug);

    if (this.overwrite) {
      this.arg = null;
      this.lastOp = null;
      this.repeat = false;
    }

    // Display informational message each time the calculator switches from
    // overwrite mode to append mode
    if (!this.overwrite)
      mylogger.display('append mode to overwrite mode', info);

    this.lcd = '0';
    this.overwrite = true;
  }

  /**
   * Square the current value on the screen.
   */
  square(): void {
    // Display debug message each time square key is pressed
    mylogger.display('square key is pressed', debug);

    if (this.lcd === 'Infinity')
      this.lcd = 'Infinity';
    else if (this.lcd === '-Infinity')
      this.lcd = 'Infinity';
    else if (this.lcd === 'NaN')
      this.lcd = 'NaN';
    else
      this.lcd = (parseFloat(this.lcd) * parseFloat(this.lcd)).toString();

    // If the number on screen is larger than Number.MAX_SAFE_INTEGER
    // or smaller than Number.MIN_SAFE_INTEGER, display warn log
    if (parseFloat(this.lcd) > Number.MAX_SAFE_INTEGER)
      mylogger.display('number on screen is larger than Number.MAX_SAFE_INTEGER', warn);
    if (parseFloat(this.lcd) < Number.MIN_SAFE_INTEGER)
      mylogger.display('number on screen is smaller than Number.MIN_SAFE_INTEGER', warn);
  }

  /**
   * Replace the number on screen with the result of dividing
   * that number by 100.
   */
  percent(): void {
    // Display debug message each time percent key is pressed
    mylogger.display('percent key is pressed', debug);

    if (this.lcd === 'Infinity')
      this.lcd = 'Infinity';
    else if (this.lcd === '-Infinity')
      this.lcd = '-Infinity';
    else if (this.lcd === 'NaN')
      this.lcd = 'NaN';
    else
      this.lcd = (parseFloat(this.lcd) / 100).toString();

    // If the number on screen is larger than Number.MAX_SAFE_INTEGER
    // or smaller than Number.MIN_SAFE_INTEGER, display warn log
    if (parseFloat(this.lcd) > Number.MAX_SAFE_INTEGER)
      mylogger.display('number on screen is larger than Number.MAX_SAFE_INTEGER', warn);
    if (parseFloat(this.lcd) < Number.MIN_SAFE_INTEGER)
      mylogger.display('number on screen is smaller than Number.MIN_SAFE_INTEGER', warn);
  }

  /**
   * Error Log Visibility
   */
  set errorLogVisibility(visibility: LogVisibility) {
    switch (visibility) {
      case LogVisibility.Display: mylogger.setLevel(error, true); break;
      case LogVisibility.Ignore: mylogger.setLevel(error, false); break;
    }
  }

  /**
   * Warning Log Visibility
   */
  set warningLogVisibility(visibility: LogVisibility) {
    switch (visibility) {
      case LogVisibility.Display: mylogger.setLevel(warn, true); break;
      case LogVisibility.Ignore: mylogger.setLevel(warn, false); break;
    }
  }

  /**
   * Info Log Visibility
   */
  set infoLogVisibility(visibility: LogVisibility) {
    switch (visibility) {
      case LogVisibility.Display: mylogger.setLevel(info, true); break;
      case LogVisibility.Ignore: mylogger.setLevel(info, false); break;
    }
  }

  /**
   * Debug Log Visibility
   */
  set debugLogVisibility(visibility: LogVisibility) {
    switch (visibility) {
      case LogVisibility.Display: mylogger.setLevel(debug, true); break;
      case LogVisibility.Ignore: mylogger.setLevel(debug, false); break;
    }
  }
}