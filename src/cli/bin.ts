#!/usr/bin/env node
import { Cli } from './cli';

void new Cli().run({ argv: process.argv.slice(2) }).then(() => process.exit(0));
