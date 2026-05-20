# Backward compatibility re-exports
# All models have been split into separate files per PRD structure.
# Import from their specific modules or from app.models directly.
from app.models.academic import *  # noqa: F403
from app.models.ai import *  # noqa: F403
from app.models.course import *  # noqa: F403
from app.models.enums import *  # noqa: F403
from app.models.evaluation import *  # noqa: F403
from app.models.gamification import *  # noqa: F403
from app.models.messaging import *  # noqa: F403
from app.models.user import *  # noqa: F403
