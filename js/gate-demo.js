/*
 * gate-demo.js - a simplified, fail-closed "plan gate" illustration.
 * SIMULATION ONLY: runs in the browser, touches nothing, is not the StrictLock code.
 * Rules follow how plan-gate.html and authorizations-record.html describe the gate:
 * deny by default, exact paths, approved command prefixes, ambiguity denies,
 * the gate's own log is never writable, resolved paths are checked,
 * and decisions go to a hash-chained log.
 * Vanilla JS, no dependencies.
 */
(function (root) {
    'use strict';

    var PLAN = {
        files: ['plan-gate.html'],
        prefixes: ['git status', 'git diff', 'git add', 'git commit'],
        logDir: 'gate-logs/'
    };

    var READ_VERBS = ['read', 'cat', 'view', 'open', 'ls', 'list', 'show', 'grep', 'head', 'tail', 'less', 'search'];
    var EDIT_VERBS = ['edit', 'write', 'modify', 'create', 'append', 'overwrite', 'delete', 'touch', 'update'];

    var PRESETS = [
        { label: 'Edit plan-gate.html', text: 'edit plan-gate.html' },
        { label: 'Read README.md', text: 'read README.md' },
        { label: 'git commit', text: 'git commit -m "update"' },
        { label: 'Edit a file outside the plan', text: 'edit index.html' },
        { label: 'git push --force to main', text: 'git push --force origin main' },
        { label: 'rm -rf docs/', text: 'rm -rf docs/' },
        { label: 'Merge to main (publishes live)', text: 'merge to main (publishes live)' },
        { label: 'Chain a command', text: 'git status && rm -rf .' },
        { label: 'Edit the decision log', text: 'edit gate-logs/decisions.jsonl' },
        { label: 'Sneak in with ..', text: 'edit plans/../gate-logs/decisions.jsonl' }
    ];

    /* ---------- pure decision logic ---------- */

    function clean(token) {
        return token.replace(/^["'`]+|["'`,]+$/g, '');
    }

    // Normalise a path: drop leading ./, collapse //, optionally resolve "..".
    function normPath(p, resolve) {
        var parts = p.replace(/\\/g, '/').split('/');
        var out = [];
        for (var i = 0; i < parts.length; i++) {
            var seg = parts[i];
            if (seg === '' || seg === '.') { continue; }
            if (seg === '..' && resolve) { out.pop(); continue; }
            out.push(seg);
        }
        return out.join('/').toLowerCase();
    }

    function inLogDir(p) {
        var dir = PLAN.logDir.replace(/\/$/, '');
        return p === dir || p.indexOf(dir + '/') === 0;
    }

    function startsWithPrefix(lower, prefix) {
        return lower === prefix || lower.indexOf(prefix + ' ') === 0;
    }

    function result(decision, cls, reason, extra) {
        return { decision: decision, cls: cls, reason: reason, note: extra || '' };
    }

    function evaluate(raw) {
        var text = String(raw == null ? '' : raw).replace(/\s+/g, ' ').trim();
        if (!text) { return null; }
        var lower = text.toLowerCase();
        var tokens = text.split(' ');
        var verb = tokens[0].toLowerCase();
        var isRead = READ_VERBS.indexOf(verb) !== -1;
        var chained = /[;&|`<>]|\$\(/.test(text);

        // Rule 1: the gate's own log is never writable (checked as written AND resolved).
        if (!isRead || chained) {
            for (var i = 1; i < tokens.length; i++) {
                var t = clean(tokens[i]);
                if (t.indexOf('/') === -1 && t.indexOf('.') === -1) { continue; }
                var written = normPath(t, false);
                var resolved = normPath(t, true);
                if (inLogDir(written)) {
                    return result('BLOCKED', 'log_self_protect',
                        'This targets the gate\'s own log directory. The gate never authorizes writes there, even if a plan names the path.');
                }
                if (inLogDir(resolved)) {
                    return result('BLOCKED', 'log_self_protect',
                        'The path looks harmless as written, but it resolves into the log directory. The gate checks the resolved path too.');
                }
            }
        }

        // Rule 2: ambiguity denies.
        if (chained) {
            return result('HELD FOR HUMAN', 'demo_ambiguous',
                'A chained or redirected command. The gate can\'t tell it stays inside one approved command, and ambiguous means deny. The agent stops for a person.');
        }

        // Rule 3: read-only actions are not gated in this demo.
        if (isRead) {
            return result('ALLOWED', 'demo_not_gated',
                'Read-only, so nothing changes.',
                'Demo simplification: the field report describes gating consequential calls such as file writes and commands.');
        }

        // Rule 4: file edit, exact path in plan.
        if (EDIT_VERBS.indexOf(verb) !== -1 && tokens.length > 1) {
            var target = normPath(clean(tokens[1]), true);
            if (PLAN.files.indexOf(target) !== -1) {
                return result('ALLOWED', 'demo_in_plan',
                    'The approved plan names this exact path, so the call runs.');
            }
            return result('HELD FOR HUMAN', 'demo_outside_plan',
                'Not in the approved plan. Denied by default; the agent stops and a person decides whether to widen the plan.');
        }

        // Rule 5: command with an approved prefix.
        for (var p = 0; p < PLAN.prefixes.length; p++) {
            if (startsWithPrefix(lower, PLAN.prefixes[p])) {
                return result('ALLOWED', 'demo_in_plan',
                    'Starts with the approved command prefix "' + PLAN.prefixes[p] + '", so the call runs.');
            }
        }

        // Rule 6: everything else is denied by default.
        if (/\b(merge|publish|deploy|release)\b/.test(lower)) {
            return result('HELD FOR HUMAN', 'demo_outside_plan',
                'Not in the approved plan, so it stops for a person.',
                'On this site a merge to main is also a publish and needs Tim\'s explicit nod. That is a workflow rule, separate from the gate.');
        }
        return result('HELD FOR HUMAN', 'demo_outside_plan',
            'Nothing in the approved plan covers this. Denied by default; the agent stops for a person.');
    }

    /* ---------- simulated hash chain (NOT cryptographic) ---------- */

    function shortHash(str) {
        var h = 0x811c9dc5;
        for (var i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
        }
        return ('00000000' + h.toString(16)).slice(-8);
    }

    var GENESIS = '00000000';

    function rowHash(row) {
        return shortHash([row.prev, row.ts, row.decision, row.cls, row.target].join('|'));
    }

    function makeRow(prev, ts, decision, cls, target) {
        var row = { ts: ts, decision: decision, cls: cls, target: target, prev: prev };
        row.h = rowHash(row);
        return row;
    }

    // Returns { ok: true } or { ok: false, row: <1-based index of first bad row> }
    function verifyChain(rows) {
        var prev = GENESIS;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].prev !== prev || rowHash(rows[i]) !== rows[i].h) {
                return { ok: false, row: i + 1 };
            }
            prev = rows[i].h;
        }
        return { ok: true };
    }

    var api = {
        evaluate: evaluate,
        presets: PRESETS,
        plan: PLAN,
        makeRow: makeRow,
        verifyChain: verifyChain,
        genesis: GENESIS
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    if (!root || !root.document) { return; }

    /* ---------- UI ---------- */

    var doc = root.document;
    var demo = doc.getElementById('gate-demo');
    if (!demo) { return; }

    var staticBlock = doc.getElementById('gate-static');
    var form = doc.getElementById('gate-form');
    var input = doc.getElementById('gate-input');
    var presetsEl = doc.getElementById('gate-presets');
    var resultEl = doc.getElementById('gate-result');
    var logEl = doc.getElementById('gate-log');
    var verifyBtn = doc.getElementById('verify-btn');
    var tamperBtn = doc.getElementById('tamper-btn');
    var tamperKind = doc.getElementById('tamper-kind');
    var resetBtn = doc.getElementById('reset-btn');
    var verifyStatus = doc.getElementById('verify-status');

    var rows = [];

    function el(tag, cls, text) {
        var n = doc.createElement(tag);
        if (cls) { n.className = cls; }
        if (text != null) { n.textContent = text; }
        return n;
    }

    function verdictClass(d) {
        return d === 'ALLOWED' ? 'allowed' : (d === 'BLOCKED' ? 'blocked' : 'held');
    }

    function verdictGlyph(d) {
        return d === 'ALLOWED' ? '✓ ' : (d === 'BLOCKED' ? '✕ ' : '◐ ');
    }

    function renderLog(badRow) {
        logEl.textContent = '';
        if (!rows.length) {
            logEl.appendChild(el('li', 'empty',
                'No decisions yet. Each one you make is appended here, and each line carries the hash of the line before it.'));
            return;
        }
        rows.forEach(function (r, i) {
            var li = el('li', (badRow === i + 1) ? 'bad' : '');
            var verb = r.decision === 'ALLOWED' ? 'allow' : 'deny';
            li.appendChild(el('span', '', (i + 1) + '  ' + r.ts + '  ' + verb + '  ' + r.cls + '  "' + r.target + '"'));
            li.appendChild(doc.createElement('br'));
            li.appendChild(el('span', 'hash', 'prev=' + r.prev + '  h=' + r.h + '  [simulation]'));
            logEl.appendChild(li);
        });
        var wrap = doc.getElementById('gate-log-wrap');
        wrap.scrollTop = wrap.scrollHeight;
    }

    function showResult(res, target) {
        resultEl.textContent = '';
        resultEl.appendChild(el('span', 'verdict ' + verdictClass(res.decision), verdictGlyph(res.decision) + res.decision));
        resultEl.appendChild(el('p', 'acted', target));
        resultEl.appendChild(el('p', 'reason', res.reason));
        if (res.note) { resultEl.appendChild(el('p', 'note', res.note)); }
        resultEl.appendChild(el('p', 'note', 'Logged as a simulated line below. Decision class: ' + res.cls + '.'));
        resultEl.classList.remove('fresh');
        void resultEl.offsetWidth;
        resultEl.classList.add('fresh');
    }

    function run(text) {
        var res = evaluate(text);
        if (!res) {
            resultEl.textContent = '';
            resultEl.appendChild(el('p', 'placeholder', 'Nothing to check yet. Type an action or choose an example.'));
            return;
        }
        var target = String(text).replace(/\s+/g, ' ').trim().slice(0, 120);
        var prev = rows.length ? rows[rows.length - 1].h : GENESIS;
        var ts = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
        rows.push(makeRow(prev, ts, res.decision, res.cls, target));
        verifyStatus.textContent = '';
        renderLog();
        showResult(res, target);
    }

    PRESETS.forEach(function (p) {
        var b = el('button', 'demo-btn quiet', p.label);
        b.type = 'button';
        b.addEventListener('click', function () {
            input.value = p.text;
            run(p.text);
        });
        presetsEl.appendChild(b);
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        run(input.value);
    });

    verifyBtn.addEventListener('click', function () {
        if (!rows.length) {
            verifyStatus.textContent = 'The log is empty. Make a decision first.';
            return;
        }
        var v = verifyChain(rows);
        if (v.ok) {
            verifyStatus.textContent = 'Chain intact: ' + rows.length + ' line' + (rows.length === 1 ? '' : 's') + ', every hash matches.';
            renderLog();
        } else {
            verifyStatus.textContent = 'Chain broken: first bad line is ' + v.row + '. (The real verifier exits 2 and names the first bad row.)';
            renderLog(v.row);
        }
    });

    tamperBtn.addEventListener('click', function () {
        var kind = tamperKind.value;
        if (!rows.length) {
            verifyStatus.textContent = 'Nothing to tamper with yet. Make a decision first.';
            return;
        }
        if (kind === 'edit') {
            var r = rows[0];
            r.decision = r.decision === 'ALLOWED' ? 'HELD FOR HUMAN' : 'ALLOWED';
            r.cls = 'edited_after_the_fact';
            verifyStatus.textContent = 'Line 1 was edited. Now press "Verify the chain".';
        } else if (kind === 'delete-middle') {
            if (rows.length < 3) {
                verifyStatus.textContent = 'A middle line needs at least three decisions in the log.';
                return;
            }
            rows.splice(Math.floor(rows.length / 2), 1);
            verifyStatus.textContent = 'A middle line was deleted. Now press "Verify the chain".';
        } else {
            rows.pop();
            verifyStatus.textContent = 'The last line was deleted. Now press "Verify the chain".';
        }
        renderLog();
        if (kind === 'delete-last' && !rows.length) {
            verifyStatus.textContent = 'The last line was deleted and the log is now empty.';
        }
    });

    resetBtn.addEventListener('click', function () {
        rows = [];
        renderLog();
        resultEl.textContent = '';
        resultEl.appendChild(el('p', 'placeholder', 'The gate\'s answer appears here.'));
        verifyStatus.textContent = 'Log reset.';
    });

    demo.hidden = false;
    if (staticBlock) { staticBlock.hidden = true; }
})(typeof window !== 'undefined' ? window : this);
