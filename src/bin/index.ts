#!/usr/bin/env node
import { Cli } from '../cli';

void new Cli().run(process.argv.slice(2)).then(() => process.exit(0));
