# Copyright 2023 Anass Bouassaba.
#
# Use of this software is governed by the Business Source License
# included in the file licenses/BSL.txt.
#
# As of the Change Date specified in that file, in accordance with
# the Business Source License, use of this software will be governed
# by the GNU Affero General Public License v3.0 only, included in the file
# licenses/AGPL.txt.

from flask import Flask
from api.routers.entities import bp as entities_bp
from api.routers.health import bp as health_bp
from api.routers.version import bp as version_bp


app = Flask(__name__)

app.register_blueprint(entities_bp)
app.register_blueprint(health_bp)
app.register_blueprint(version_bp)
